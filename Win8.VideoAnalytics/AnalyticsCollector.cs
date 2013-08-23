﻿using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
#if SILVERLIGHT
using System.Windows.Threading;
#else
using Windows.System.Threading;
using Windows.UI.Core;
#endif

namespace Microsoft.VideoAnalytics
{
    /// <summary>
    /// The primary class responsible for connecting to an instance of SSME and reporting diagnostic information.
    /// </summary>
    public sealed class AnalyticsCollector : ILoggingSource
    {
        private readonly DateTimeOffset videoSessionStartTime = DateTimeOffset.Now;

        private AnalyticsConfig configuration;
#if SILVERLIGHT
        private Timer reportTimer;
        private Timer pollingTimer;
#else
        private ThreadPoolTimer reportTimer;
        private ThreadPoolTimer pollingTimer;
#endif
        private TaskCompletionSource<StreamLoadedLog> streamLoadTask;
        private QualityReportAggregator qualityReportAggregator;
        private DownloadErrorReportAggregator downloadErrorReportAggregator;
        private bool isLive;
        private bool isPaused = true;

        /// <summary>
        /// Gets or sets the a Dispatcher to be used to poll CPU and FPS metrics. Set to null if one is not needed.
        /// </summary>
#if SILVERLIGHT
        public Dispatcher Dispatcher { get; set; }
#else
        public CoreDispatcher Dispatcher { get; set; }
#endif

        /// <summary>
        /// Gets whether or not this object is in an attached state
        /// </summary>
        public bool IsAttached { get; private set; }

        /// <summary>
        /// Gets the object responsible for reporting on system and app specific information
        /// </summary>
        public IEnvironmentMonitor EnvironmentMonitor { get; private set; }

        /// <summary>
        /// Gets the main player object.
        /// </summary>
        public IPlayerMonitor Player { get; private set; }

        /// <summary>
        /// Gets an optional object to help provide adaptive heuristics data. For progressive download this will be null.
        /// </summary>
        public IAdaptiveMonitor AdaptiveMonitor { get; private set; }

        /// <summary>
        /// Gets an optional object to help provide information about the server serving the content.
        /// </summary>
        public IEdgeServerMonitor EdgeServerMonitor { get; private set; }

        /// <summary>
        /// Gets a generated ID used for the life of the AnalyticsCollector
        /// </summary>
        public Guid VideoSessionId { get; private set; }

        /// <summary>
        /// Gets the total time for the life of the AnalyticsCollector
        /// </summary>
        public TimeSpan VideoSessionDuration { get { return DateTimeOffset.Now.Subtract(videoSessionStartTime); } }

        /// <summary>
        /// Gets or sets addtional data to add to each log
        /// </summary>
        public IDictionary<string, object> AddtionalData { get; private set; }

        /// <summary>
        /// Gets or sets the Configuration data used to drive the AnalyticsCollector. Note: if the analytics collector is already attached, some changes may not take effect until it is reattached.
        /// </summary>
        public AnalyticsConfig Configuration
        {
            get { return configuration; }
            set
            {
                if (configuration != null)
                {
                    foreach (var item in configuration.AdditionalData)
                    {
                        AddtionalData.Remove(item.Key);
                    }
                }
                configuration = value;
                if (configuration != null)
                {
                    foreach (var item in configuration.AdditionalData)
                    {
                        AddtionalData.Add(item.Key, item.Value);
                    }
                }
            }
        }

        /// <summary>
        /// Provides all simple diagnostic events.
        /// </summary>
        public event EventHandler<LogEventArgs> LogCreated;

        CancellationTokenSource cts;

        /// <summary>
        /// Creates a new instance of AnalyticsCollector.
        /// </summary>
        public AnalyticsCollector()
        {
            VideoSessionId = Guid.NewGuid();
            AddtionalData = new Dictionary<string, object>();
        }

        /// <summary>
        /// Creates a new instance of AnalyticsCollector.
        /// </summary>
        /// <param name="config">The required configuration object for the AnalyticsCollector</param>
        public AnalyticsCollector(AnalyticsConfig config)
            : this()
        {
            if (config == null)
                throw new ArgumentNullException("config");

            Configuration = config;
        }

        void AddLog(ILog log)
        {
            if (qualityReportAggregator != null) qualityReportAggregator.AddLog(log);
            if (downloadErrorReportAggregator != null) downloadErrorReportAggregator.AddLog(log);
            OnLogCreated(log);
        }

        void AttachEvents()
        {
            cts = new CancellationTokenSource();

            Player.Paused += Player_Paused;
            Player.Playing += Player_Playing;
            Player.StreamLoaded += Player_StreamLoaded;
            Player.StreamEnded += Player_StreamEnded;
            Player.StreamStarted += Player_StreamStarted;
            Player.StreamClosed += Player_StreamClosed;
            Player.StreamFailed += Player_StreamFailed;
            Player.FullScreenChanged += Player_FullScreenChanged;
            Player.PlaybackRateChanged += Player_PlaybackRateChanged;
            Player.Seeked += Player_Seeked;
            Player.ScrubStarted += Player_ScrubStarted;
            Player.ScrubCompleted += Player_ScrubCompleted;
            Player.IsBufferingChanged += Player_IsBufferingChanged;
            Player.IsLiveChanged += Player_IsLiveChanged;
            Player.CaptionTrackChanged += Player_CaptionTrackChanged;
            Player.AudioTrackChanged += Player_AudioTrackChanged;
            Player.ClipStarted += Player_ClipStarted;
            Player.ClipEnded += Player_ClipEnded;
            Player.PlayTimeReached += Player_PlayTimeReached;
            Player.PositionReached += Player_PositionReached;
            Player.PlayTimePercentageReached += Player_PlayTimePercentageReached;
            Player.PositionPercentageReached += Player_PositionPercentageReached;

            if (AdaptiveMonitor != null)
            {
                AdaptiveMonitor.ChunkDownloaded += AdaptiveMonitor_ChunkDownloaded;
                AdaptiveMonitor.ChunkFailure += AdaptiveMonitor_ChunkFailure;
                AdaptiveMonitor.CurrentBitrateChanged += AdaptiveMonitor_CurrentBitrateChanged;
            }
        }

        void DetachEvents()
        {
            cts.Cancel();

            if (Player != null)
            {
                Player.Paused -= Player_Paused;
                Player.Playing -= Player_Playing;
                Player.StreamStarted -= Player_StreamStarted;
                Player.StreamLoaded -= Player_StreamLoaded;
                Player.StreamClosed -= Player_StreamClosed;
                Player.StreamEnded -= Player_StreamEnded;
                Player.StreamFailed -= Player_StreamFailed;
                Player.FullScreenChanged -= Player_FullScreenChanged;
                Player.PlaybackRateChanged -= Player_PlaybackRateChanged;
                Player.Seeked -= Player_Seeked;
                Player.ScrubStarted -= Player_ScrubStarted;
                Player.ScrubCompleted -= Player_ScrubCompleted;
                Player.IsBufferingChanged -= Player_IsBufferingChanged;
                Player.IsLiveChanged -= Player_IsLiveChanged;
                Player.CaptionTrackChanged -= Player_CaptionTrackChanged;
                Player.AudioTrackChanged -= Player_AudioTrackChanged;
                Player.ClipStarted -= Player_ClipStarted;
                Player.ClipEnded -= Player_ClipEnded;
                Player.PlayTimeReached -= Player_PlayTimeReached;
                Player.PositionReached -= Player_PositionReached;
                Player.PlayTimePercentageReached -= Player_PlayTimePercentageReached;
                Player.PositionPercentageReached -= Player_PositionPercentageReached;
            }

            if (AdaptiveMonitor != null)
            {
                AdaptiveMonitor.ChunkDownloaded -= AdaptiveMonitor_ChunkDownloaded;
                AdaptiveMonitor.ChunkFailure -= AdaptiveMonitor_ChunkFailure;
                AdaptiveMonitor.CurrentBitrateChanged -= AdaptiveMonitor_CurrentBitrateChanged;
            }

            cts.Dispose();
            cts = null;
        }

        void AdaptiveMonitor_ChunkFailure(object sender, ChunkFailureEventArgs e)
        {
            AddLog(new DownloadErrorLog()
            {
                ChunkId = e.ChunkId,
                HttpResponse = e.HttpResponse
            });
        }

        void AdaptiveMonitor_CurrentBitrateChanged(object sender, CurrentBitrateChangedEventArgs e)
        {
            AddLog(new BitrateChangedLog(AdaptiveMonitor.CurrentBitrate, "video"));
        }

        void AdaptiveMonitor_ChunkDownloaded(object sender, ChunkDownloadedEventArgs e)
        {
            AddLog(new ChunkDownloadLog(e.StreamType, e.ChunkId, e.StartTime, e.DownloadTimeMs));

            if (Configuration.LatencyAlertThreshold.HasValue)
            {
                if (e.DownloadTimeMs > 75)
                {
                    double dataSizeKB = e.ByteCount / 1024;
                    double observedThroughput = dataSizeKB / ((e.DownloadTimeMs - 75) / 1000);
                    double perceivedKBps = (double)e.PerceivedBandwidth / (1024 * 8);
                    if (observedThroughput < (perceivedKBps / Configuration.LatencyAlertThreshold.Value))
                    {
                        AddLog(new LatencyAlertLog(e.Bitrate, e.StreamType, e.ChunkId, e.StartTime, e.DownloadTimeMs));
                    }
                }
            }
        }

        void reportTimer_Tick(object sender)
        {
            try
            {
                if (qualityReportAggregator != null)
                {
                    var qualityReport = qualityReportAggregator.GetReport(Configuration.AggregationInterval);
                    OnLogCreated(qualityReport);
                }
                if (downloadErrorReportAggregator != null)
                {
                    var downloadErrorReports = downloadErrorReportAggregator.GetReport(Configuration.AggregationInterval);
                    foreach (var downloadErrorReport in downloadErrorReports)
                    {
                        OnLogCreated(downloadErrorReport);
                    }
                }
            }
            catch (OperationCanceledException) { /* ignore, we were canceled */ }
        }

        void pollingTimer_Tick(object sender)
        {
            if (Dispatcher != null)
            {
                // these metrics need to get polled from the UI thread.
#if SILVERLIGHT
                Dispatcher.BeginInvoke(PollUIThreadLogs);
#else
                var t = Dispatcher.RunAsync(CoreDispatcherPriority.Normal, PollUIThreadLogs);
#endif
            }
            else
            {
                PollUIThreadLogs();
            }

            // get adaptive heuristics data on a background thread
            if (AdaptiveMonitor != null)
            {
                AdaptiveMonitor.Refresh();
                AddLog(new BufferSizeLog(AdaptiveMonitor.VideoBufferSize, "video"));
                AddLog(new BufferSizeLog(AdaptiveMonitor.AudioBufferSize, "audio"));
                AddLog(new PerceivedBandwidthLog(AdaptiveMonitor.PerceivedBandwidth));
            }
        }

        private void PollUIThreadLogs()
        {
            if (Player != null)
            {
                // get fps data
                AddLog(new FpsLog(Player.RenderedFramesPerSecond, Player.DroppedFramesPerSecond));
            }

            if (EnvironmentMonitor != null)
            {
                // get environment data
                AddLog(new CpuLog(EnvironmentMonitor.SystemCpuLoad, EnvironmentMonitor.ProcessCpuLoad));
            }
        }

        void OnLogCreated(ILog log)
        {
            SendLog(log);
        }

        /// <summary>
        /// Call to send a log to the logging service and stamp it with additional data related to the current video.
        /// </summary>
        /// <param name="log">The log to send.</param>
        public async void SendLog(ILog log)
        {
            // add all the extra info to the log
            log.ExtraData.Add("VideoSessionId", VideoSessionId);
            log.ExtraData.Add("VideoSessionDuration", VideoSessionDuration);
            log.ExtraData.Add("IsLive", isLive);
            foreach (var kvp in AddtionalData.ToList())
            {
                log.ExtraData.Add(kvp);
            }

            // add additional info about the stream (which may require us to wait until it's finished).
            StreamLoadedLog streamLoadedLog = null;
            if (streamLoadTask != null)
            {
                streamLoadedLog = await streamLoadTask.Task;
            }
            if (streamLoadedLog != null)
            {
                log.ExtraData.Add("EdgeIP", streamLoadedLog.EdgeServer);
                log.ExtraData.Add("RelatedLogId", streamLoadedLog.Id);
                log.ExtraData.Add("VideoUrl", streamLoadedLog.Source);
            }

            // notify that the log is ready
            if (LogCreated != null) LogCreated(this, new LogEventArgs(log));
        }

        void Player_ScrubCompleted(object sender, ScrubCompletedEventArgs e)
        {
            AddLog(new DvrOperationLog(DvrOperationType.ScrubCompleted, e.Position, Player.PlaybackRate, isPaused, null));
        }

        void Player_ScrubStarted(object sender, object e)
        {
            AddLog(new DvrOperationLog(DvrOperationType.ScrubStarted, Player.Position, Player.PlaybackRate, isPaused, null));
        }

        void Player_Seeked(object sender, SeekedEventArgs e)
        {
            AddLog(new DvrOperationLog(DvrOperationType.Seeked, e.NewPosition, Player.PlaybackRate, isPaused, e.PreviousPosition));
        }

        void Player_PlaybackRateChanged(object sender, object e)
        {
            AddLog(new DvrOperationLog(DvrOperationType.PlayrateChanged, Player.Position, Player.PlaybackRate, isPaused, null));
        }

        void Player_AudioTrackChanged(object sender, object e)
        {
            AddLog(new AudioTrackChangedLog(Player.AudioTrackId));
        }

        void Player_CaptionTrackChanged(object sender, object e)
        {
            AddLog(new CaptionTrackChangedLog(Player.CaptionTrackId));
        }

        void Player_IsLiveChanged(object sender, object e)
        {
            isLive = Player.IsLive;
        }

        void Player_FullScreenChanged(object sender, object e)
        {
            AddLog(new FullscreenChangedLog(Player.IsFullScreen));
        }

        void Player_ClipEnded(object sender, ClipEventArgs e)
        {
            AddLog(new ClipEventLog(ClipEventType.Ended, Player.Position, e.Source));
        }

        void Player_ClipStarted(object sender, ClipEventArgs e)
        {
            AddLog(new ClipEventLog(ClipEventType.Started, Player.Position, e.Source));
        }

        void Player_StreamStarted(object sender, object e)
        {
            AddLog(new StreamEventLog(StreamEventType.Started, Player.Position, Player.Duration));
        }

        void Player_Playing(object sender, object e)
        {
            if (isPaused)
            {
                isPaused = false;
                AddLog(new StreamEventLog(StreamEventType.Playing, Player.Position, Player.Duration));
                AddLog(new DvrOperationLog(DvrOperationType.Play, Player.Position, Player.PlaybackRate, isPaused, null));
            }
        }

        void Player_Paused(object sender, object e)
        {
            if (!isPaused)
            {
                isPaused = true;
                AddLog(new StreamEventLog(StreamEventType.Paused, Player.Position, Player.Duration));
                AddLog(new DvrOperationLog(DvrOperationType.Pause, Player.Position, Player.PlaybackRate, isPaused, null));
            }
        }

        void Player_IsBufferingChanged(object sender, object e)
        {
            AddLog(new BufferingChangedLog(Player.IsBuffering));
        }

        void Player_StreamFailed(object sender, StreamFailedEventArgs e)
        {
            AddLog(new StreamEventLog(StreamEventType.Failed, Player.Position, Player.Duration));
            AddLog(new StreamFailedLog(e.ErrorMessage));
        }

        async void Player_StreamLoaded(object sender, object e)
        {
            isPaused = true;
            AddLog(new StreamEventLog(StreamEventType.Loaded, TimeSpan.Zero, Player.Duration));

            var loadedLog = new StreamLoadedLog(Player.Source);
            if (AdaptiveMonitor != null)
            {
                loadedLog.MaxBitrate = AdaptiveMonitor.MaxBitrate;
                loadedLog.MinBitrate = AdaptiveMonitor.MinBitrate;
            }

            EdgeServerResult edgeResult = EdgeServerResult.Empty;
            if (Player.Source.IsAbsoluteUri)
            {
                var sourceRoot = GetUrlWithoutQueryString(Player.Source);
                try
                {
                    edgeResult = await GetEdgeServerAsync(new Uri(sourceRoot, UriKind.Absolute));
                }
                catch (OperationCanceledException) { /* ignore */ }
            }

            loadedLog.EdgeServer = edgeResult.EdgeServer;
            loadedLog.ClientIp = edgeResult.ClientIP;
            AddLog(loadedLog);
            streamLoadTask.SetResult(loadedLog);
        }

        void Player_StreamEnded(object sender, object e)
        {
            AddLog(new StreamEventLog(StreamEventType.Ended, Player.Position, Player.Duration));
            isPaused = true;
        }

        void Player_StreamClosed(object sender, object e)
        {
            isPaused = true;
            AddLog(new StreamEventLog(StreamEventType.Unloaded, Player.Position, Player.Duration));
            streamLoadTask = new TaskCompletionSource<StreamLoadedLog>();
        }

        void Player_PositionReached(object sender, PositionReachedEventArgs e)
        {
            AddLog(new PositionReachedLog(e.Position));
        }

        void Player_PlayTimeReached(object sender, PlayTimeReachedEventArgs e)
        {
            AddLog(new PlayTimeReachedLog(e.PlayTime));
        }

        void Player_PositionPercentageReached(object sender, PositionPercentageReachedEventArgs e)
        {
            AddLog(new PositionPercentageReachedLog(e.Position));
        }

        void Player_PlayTimePercentageReached(object sender, PlayTimePercentageReachedEventArgs e)
        {
            AddLog(new PlayTimePercentageReachedLog(e.PlayTime));
        }

        async Task<EdgeServerResult> GetEdgeServerAsync(Uri currentStreamUri)
        {
            EdgeServerResult result = null;
            if (EdgeServerMonitor != null)
            {
                try
                {
#if SILVERLIGHT
                    result = await EdgeServerMonitor.GetEdgeServerAsync(currentStreamUri, cts.Token);
#else
                    result = await EdgeServerMonitor.GetEdgeServerAsync(currentStreamUri).AsTask(cts.Token);
#endif
                }
                catch (OperationCanceledException) { throw; }
                catch { /* unable to get edge server info, nothing we can do but continue */}
            }

            return result ?? EdgeServerResult.Empty;
        }

        static string GetUrlWithoutQueryString(Uri uri)
        {
            string ret = uri.ToString();
            ret = ret.Substring(0, ret.Length - uri.Query.Length);
            return ret;
        }

        /// <summary>
        /// Connects a player that needs to be monitored
        /// </summary>
        public void Attach(IPlayerMonitor player, IAdaptiveMonitor adaptiveMonitor, IEnvironmentMonitor environmentMonitor, IEdgeServerMonitor edgeServerMonitor)
        {
            if (!IsAttached)
            {
                IsAttached = true;

                if (player == null) throw new ArgumentNullException("player");
                streamLoadTask = new TaskCompletionSource<StreamLoadedLog>();

                EdgeServerMonitor = edgeServerMonitor;
                AdaptiveMonitor = adaptiveMonitor;
                Player = player;
                EnvironmentMonitor = environmentMonitor;

                if (Configuration.TrackQuality)
                {
                    qualityReportAggregator = new QualityReportAggregator(Configuration.QualityConfig);
                }
                if (Configuration.TrackDownloadErrors)
                {
                    downloadErrorReportAggregator = new DownloadErrorReportAggregator();
                }

                AttachEvents();

                if (Configuration.PollingInterval > TimeSpan.Zero)
                {
#if SILVERLIGHT
                    pollingTimer = new Timer(pollingTimer_Tick, null, Configuration.PollingInterval, Configuration.PollingInterval);
#else
                    pollingTimer = ThreadPoolTimer.CreatePeriodicTimer(pollingTimer_Tick, Configuration.PollingInterval);
#endif
                }
                if (Configuration.AggregationInterval > TimeSpan.Zero)
                {
#if SILVERLIGHT
                    reportTimer = new Timer(reportTimer_Tick, null, Configuration.AggregationInterval, Configuration.AggregationInterval);
#else
                    reportTimer = ThreadPoolTimer.CreatePeriodicTimer(reportTimer_Tick, Configuration.AggregationInterval);
#endif
                }
            }
        }

        /// <summary>
        /// Disconnects the player that was passed to the Attach method
        /// </summary>
        public void Detach()
        {
            if (IsAttached)
            {
                if (reportTimer != null)
                {
#if SILVERLIGHT
                    reportTimer.Dispose();
#else
                    reportTimer.Cancel();
#endif
                    reportTimer = null;
                }
                if (pollingTimer != null)
                {
#if SILVERLIGHT
                    pollingTimer.Dispose();
#else
                    pollingTimer.Cancel();
#endif
                    pollingTimer = null;
                }
                DetachEvents();
                Player = null;
                AdaptiveMonitor = null;
                streamLoadTask = null;
                qualityReportAggregator = null;
                downloadErrorReportAggregator = null;

                IsAttached = false;
            }
        }
    }
}
