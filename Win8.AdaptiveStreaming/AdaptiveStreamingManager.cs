﻿using Microsoft.Media.AdaptiveStreaming;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Media;
using Windows.UI.Core;
using System.Runtime.InteropServices.WindowsRuntime;

namespace Microsoft.AdaptiveStreaming
{
    /// <summary>
    /// Wraps the MediaExtensionManager to help initialize the Smooth Streaming SDK
    /// </summary>
    public sealed class AdaptiveStreamingManager
    {
        const string SmoothPropertySetId = "{A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D}";    //always use {A5CE1DE8-1D00-427B-ACEF-FB9A3C93DE2D} to AdaptiveSourceManager 
        const int ChunkLivePollingIntervalMilliseconds = 1000;
        const int ChunkCachePollingIntervalMilliseconds = 1000;

        private PropertySet propertySet;
        private CoreDispatcher dispatcher;
        private uint? maxBitrate;
        private uint? minBitrate;
        private Size? maxSize;
        private readonly object adaptiveSourceLock = new object();
        private IDownloaderPlugin downloaderPlugin;
        private SortedSet<BitrateLogEntry> bitrateLog = new SortedSet<BitrateLogEntry>();
        private CancellationTokenSource mainCancellationTokenSource;
        private CancellationTokenSource fragmentCancellationTokenSource;
        private readonly object fragmentPollingLock = new object();

        public event EventHandler<DataReceivedEventArgs> DataReceived;
        public event EventHandler<DataErrorEventArgs> DataError;
        public event EventHandler<object> OpenedBackground;
        public event EventHandler<object> ClosedBackground;
        public event EventHandler<object> Opened;
        public event EventHandler<object> Closed;
        public event EventHandler<RefreshingStateEventArgs> RefreshingState;

        private bool isStartupBitrateActive;
        private TimeSpan Position { get; set; }
        public bool IsInitialized { get; private set; }
        public Uri SourceUri { get; set; }
        public MediaExtensionManager MediaExtensionManager { get; private set; }
        public IAdaptiveSourceManager AdaptiveSrcManager { get; private set; }
        public IAdaptiveSource ActiveAdaptiveSource { get; private set; }

        public AdaptiveStreamingManager()
        {
            IsIsmtEnabled = true;
        }

        public IDownloaderPlugin DownloaderPlugin
        {
            get { return downloaderPlugin; }
            set
            {
                downloaderPlugin = value;
                if (AdaptiveSrcManager != null)
                {
                    AdaptiveSrcManager.SetDownloaderPlugin(downloaderPlugin);
                }
            }
        }

        public bool IsIsmtEnabled { get; set; }

        public bool IsOpen
        {
            get { return ActiveAdaptiveSource != null; }
        }

        public bool IsManifestReady
        {
            get { return IsOpen && ActiveAdaptiveSource.Manifest != null; }
        }

        public IManifestStream VideoStream
        {
            get
            {
                return IsManifestReady ? ActiveAdaptiveSource.Manifest.SelectedStreams.FirstOrDefault(s => s.Type == MediaStreamType.Video) : null;
            }
        }

        /// <summary>
        /// Initializes the smooth streaming SDK.
        /// </summary>
        /// <param name="mediaExtensionManager">The MediaExtensionManager object to be used. This is passed in to make sure everyone is reusing the same instance.</param>
        public void Initialize(MediaExtensionManager mediaExtensionManager)
        {
            if (!Windows.ApplicationModel.DesignMode.DesignModeEnabled)
            {
                dispatcher = CoreWindow.GetForCurrentThread().Dispatcher;
            }
            MediaExtensionManager = mediaExtensionManager;

            AdaptiveSrcManager = AdaptiveSourceManager.GetDefault();
            if (DownloaderPlugin != null)
            {
                AdaptiveSrcManager.SetDownloaderPlugin(DownloaderPlugin);
            }
            AdaptiveSrcManager.AdaptiveSourceOpenedEvent += AdaptiveSrcManager_AdaptiveSourceOpenedEvent;
            AdaptiveSrcManager.AdaptiveSourceClosedEvent += AdaptiveSrcManager_AdaptiveSourceClosedEvent;
            AdaptiveSrcManager.AdaptiveSourceStatusUpdatedEvent += AdaptiveSrcManager_AdaptiveSourceStatusUpdatedEvent;
            AdaptiveSrcManager.ManifestReadyEvent += AdaptiveSrcManager_ManifestReadyEvent;

            propertySet = new PropertySet();
            propertySet[SmoothPropertySetId] = AdaptiveSrcManager;

            mainCancellationTokenSource = new CancellationTokenSource();

            IsInitialized = true;
        }

        /// <summary>
        /// Uninitializes the smooth streaming SDK.
        /// </summary>
        public void Uninitialize()
        {
            if (IsInitialized)
            {
                AdaptiveSrcManager.AdaptiveSourceOpenedEvent -= AdaptiveSrcManager_AdaptiveSourceOpenedEvent;
                AdaptiveSrcManager.AdaptiveSourceClosedEvent -= AdaptiveSrcManager_AdaptiveSourceClosedEvent;
                AdaptiveSrcManager.AdaptiveSourceStatusUpdatedEvent -= AdaptiveSrcManager_AdaptiveSourceStatusUpdatedEvent;
                AdaptiveSrcManager.ManifestReadyEvent -= AdaptiveSrcManager_ManifestReadyEvent;
                AdaptiveSrcManager = null;

                ActiveAdaptiveSource = null;

                propertySet[SmoothPropertySetId] = null;
                propertySet = null;

                MediaExtensionManager = null;
                dispatcher = null;
                mainCancellationTokenSource.Dispose();
                mainCancellationTokenSource = null;

                IsInitialized = false;
            }
        }

        public void RegisterByteStreamHandler(string fileExtension, string mimeType)
        {
            MediaExtensionManager.RegisterByteStreamHandler("Microsoft.Media.AdaptiveStreaming.SmoothByteStreamHandler", fileExtension, mimeType, propertySet);
        }

        public void RegisterSchemeHandler(string scheme)
        {
            MediaExtensionManager.RegisterSchemeHandler("Microsoft.Media.AdaptiveStreaming.SmoothSchemeHandler", scheme, propertySet);
        }

        /// <summary>
        /// Any time we go out to the UI thread and the action could result in access to the ActiveAdaptiveSource, we have to be aware that the ActiveAdaptiveSource could get set to null from another thread.
        /// </summary>
        /// <param name="action">The action to perform on the UI thread.</param>
        private async void RunOnProtectedUIThread(Action action, bool checkIsOpen = true)
        {
            if (!Windows.ApplicationModel.DesignMode.DesignModeEnabled && dispatcher != null)
            {
                await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
                {
                    if (checkIsOpen)
                    {
                        lock (adaptiveSourceLock)
                        {
                            if (IsOpen)
                            {
                                action();
                            }
                        }
                    }
                    else
                    {
                        action();
                    }
                });
            }
        }

        void AdaptiveSrcManager_AdaptiveSourceOpenedEvent(AdaptiveSource sender, AdaptiveSourceOpenedEventArgs args)
        {
            lock (adaptiveSourceLock)
            {
                if (SourceUri == null || (args.AdaptiveSource.Uri.Host == SourceUri.Host && args.AdaptiveSource.Uri.PathAndQuery == SourceUri.PathAndQuery))
                {
                    ActiveAdaptiveSource = args.AdaptiveSource;
                    if (DownloaderPlugin is ILifetimeAwareDownloaderPlugin)
                    {
                        ((ILifetimeAwareDownloaderPlugin)DownloaderPlugin).OnOpenMedia(args.AdaptiveSource.Uri);
                    }
                    if (OpenedBackground != null) OpenedBackground(this, EventArgs.Empty);
                    RunOnProtectedUIThread(() => { if (Opened != null) Opened(this, EventArgs.Empty); }, false);
                }
            }
        }

        void AdaptiveSrcManager_AdaptiveSourceClosedEvent(AdaptiveSource sender, AdaptiveSourceClosedEventArgs args)
        {
            lock (adaptiveSourceLock)
            {
                if (IsOpen && ActiveAdaptiveSource == args.AdaptiveSource)
                {
                    isStartupBitrateActive = false;
                    ActiveAdaptiveSource = null;
                    if (DownloaderPlugin is ILifetimeAwareDownloaderPlugin)
                    {
                        ((ILifetimeAwareDownloaderPlugin)DownloaderPlugin).OnCloseMedia(args.AdaptiveSource.Uri);
                    }
                    lock (bitrateLog)
                    {
                        bitrateLog.Clear();
                    }
                    if (ClosedBackground != null) ClosedBackground(this, EventArgs.Empty);
                    RunOnProtectedUIThread(() => { if (Closed != null) Closed(this, EventArgs.Empty); }, false);
                }
            }
        }

        /// <summary>
        /// Indicates that the media has buffered enough and playback is ready.
        /// If StartupBitrate was set: this is our cue to allow all tracks to be selected once again
        /// If StartupBitrate was not set, this method has no meaning.
        /// </summary>
        public void MediaReady()
        {
            if (isStartupBitrateActive)
            {
                lock (adaptiveSourceLock) // safe guard against being closed on a background thread
                {
                    if (IsOpen)
                    {
                        // select all eligable tracks
                        UpdateSelectedTracks();
                    }
                }
            }
        }

        public void RefreshState(TimeSpan position)
        {
            Position = position;
            if (RefreshingState != null) RefreshingState(this, new RefreshingStateEventArgs(position));

            IManifestTrack selectedTrack = null;
            lock (bitrateLog) // make this is thread safe since the collection can be updated on a background thread.
            {
                foreach (var item in bitrateLog.ToList())
                {
                    if (item.TimeStamp <= position.Ticks)
                    {
                        bitrateLog.Remove(item);
                        selectedTrack = item.Track;
                    }
                    else break;
                }
            }

            if (selectedTrack != null)
            {
                CurrentBitrate = selectedTrack.Bitrate;
                CurrentWidth = selectedTrack.MaxWidth;
                CurrentHeight = selectedTrack.MaxHeight;
                var videoStream = VideoStream;
                LowestBitrate = videoStream.SelectedTracks.Min(t => t.Bitrate);
                HighestBitrate = videoStream.SelectedTracks.Max(t => t.Bitrate);
                if (StateChanged != null) StateChanged(this, EventArgs.Empty);
            }
        }

        void AdaptiveSrcManager_AdaptiveSourceStatusUpdatedEvent(AdaptiveSource sender, AdaptiveSourceStatusUpdatedEventArgs args)
        {
            lock (adaptiveSourceLock)
            {
                if (IsOpen && ActiveAdaptiveSource == args.AdaptiveSource)
                {
                    switch (args.UpdateType)
                    {
                        case AdaptiveSourceStatusUpdateType.BitrateChanged:
                            var videoStream = VideoStream;
                            if (videoStream != null)
                            {
                                var bitrateInfo = args.AdditionalInfo.Split(';');
                                var bitrate = uint.Parse(bitrateInfo[0]);
                                var timeStamp = long.Parse(bitrateInfo[1]);
                                var selectedTrack = videoStream.SelectedTracks.FirstOrDefault(t => t.Bitrate == bitrate);
                                if (selectedTrack != null)
                                {
                                    lock (bitrateLog) // make this is thread safe since we'll be accessing it from the UI thread in .RefreshState
                                    {
                                        bitrateLog.Add(new BitrateLogEntry(timeStamp, selectedTrack));
                                    }
                                }
                            }
                            break;
                        case AdaptiveSourceStatusUpdateType.EndOfLive:
                            IsLive = false;
                            RunOnProtectedUIThread(() => { if (EndOfLive != null) EndOfLive(this, EventArgs.Empty); });
                            break;
                        case AdaptiveSourceStatusUpdateType.StartEndTime:
                            StartTime = args.StartTime;
                            EndTime = Math.Max(args.EndTime, args.StartTime + args.AdaptiveSource.Manifest.Duration);
                            LivePosition = args.EndTime;
                            RunOnProtectedUIThread(() => { if (TimesChanged != null) TimesChanged(this, EventArgs.Empty); });
                            break;
                        case AdaptiveSourceStatusUpdateType.OutsideWindowEdge:
                            RunOnProtectedUIThread(() => { if (OutsideWindowEdge != null) OutsideWindowEdge(this, EventArgs.Empty); });
                            break;
                    }
                }
            }
        }

        void AdaptiveSrcManager_ManifestReadyEvent(AdaptiveSource sender, ManifestReadyEventArgs args)
        {
            lock (adaptiveSourceLock)
            {
                if (IsOpen && ActiveAdaptiveSource == args.AdaptiveSource)
                {
                    IsLive = ActiveAdaptiveSource.Manifest.IsLive;
                    UpdateSelectedTracks(StartupBitrate);
                    AvailableAudioStreams = ActiveAdaptiveSource.Manifest.AvailableStreams.Where(IsAudioStream).Select(s => new AdaptiveAudioStream(s)).ToList();
                    AvailableCaptionStreams = ActiveAdaptiveSource.Manifest.AvailableStreams.Where(IsCaptionStream).Select(s => new AdaptiveCaptionStream(s)).ToList();
                    RunOnProtectedUIThread(() => { if (ManifestReady != null) ManifestReady(this, EventArgs.Empty); });
                    StartTime = (long)args.AdaptiveSource.Manifest.StartTime;
                    EndTime = StartTime + args.AdaptiveSource.Manifest.Duration;
                    LivePosition = EndTime;
                    RunOnProtectedUIThread(() => { if (TimesChanged != null) TimesChanged(this, EventArgs.Empty); });
                }
            }
        }

        #region Live Playback
        public bool IsLive { get; private set; }

#if SILVERLIGHT
        public event EventHandler OutsideWindowEdge;
#else
        public event EventHandler<object> OutsideWindowEdge;
#endif

#if SILVERLIGHT
        public event EventHandler EndOfLive;
#else
        public event EventHandler<object> EndOfLive;
#endif

#if SILVERLIGHT
        public event EventHandler TimesChanged;
#else
        public event EventHandler<object> TimesChanged;
#endif

        public long LivePosition { get; private set; }

        public long StartTime { get; private set; }

        public long EndTime { get; private set; }
        #endregion

        #region Audio Streams
        public IReadOnlyList<AdaptiveAudioStream> AvailableAudioStreams { get; private set; }

        static bool IsAudioStream(IManifestStream stream)
        {
            return stream.Type == MediaStreamType.Audio;
        }

        public AdaptiveAudioStream SelectedAudioStream
        {
            get
            {
                lock (adaptiveSourceLock)
                {
                    if (IsManifestReady)
                    {
                        var selectedStream = ActiveAdaptiveSource.Manifest.SelectedStreams.FirstOrDefault(IsAudioStream);
                        var result = AvailableAudioStreams.FirstOrDefault(s => s.ManifestStream.Name == selectedStream.Name);
                        return result;
                    }
                    else return null;
                }
            }
            set
            {
                lock (adaptiveSourceLock)
                {
                    if (IsManifestReady)
                    {
                        var selectedStreams = ActiveAdaptiveSource.Manifest.SelectedStreams.ToList();
                        var oldAudioStream = selectedStreams.FirstOrDefault(IsAudioStream);
                        if (oldAudioStream != null)
                        {
                            selectedStreams.Remove(oldAudioStream);
                        }
                        var newAudioStream = value != null ? ActiveAdaptiveSource.Manifest.AvailableStreams.FirstOrDefault(s => s.Name == value.ManifestStream.Name) : null;
                        if (newAudioStream != null)
                        {
                            selectedStreams.Add(newAudioStream);
                        }
                        if (newAudioStream != oldAudioStream)
                        {
                            // run on background thread since this can block UI thread
                            var selectionOperation = Task.Run(() => ActiveAdaptiveSource.Manifest.SelectStreamsAsync(selectedStreams).AsTask());
                        }
                    }
                }
            }
        }
        #endregion

        #region Bitrates
#if SILVERLIGHT
        public event EventHandler ManifestReady;
#else
        public event EventHandler<object> ManifestReady;
#endif

        /// <summary>
        /// Gets the lowest bitrate of the selected video track
        /// </summary>
        public uint LowestBitrate { get; private set; }

        /// <summary>
        /// Gets the highest bitrate of the selected video track
        /// </summary>
        public uint HighestBitrate { get; private set; }

        /// <summary>
        /// Gets the bitrate of the selected video track
        /// </summary>
        public uint CurrentBitrate { get; private set; }

        /// <summary>
        /// Gets the width of the selected video track
        /// </summary>
        public uint CurrentWidth { get; private set; }

        /// <summary>
        /// Gets the height of the selected video track
        /// </summary>
        public uint CurrentHeight { get; private set; }

        class BitrateLogEntry : IComparable<BitrateLogEntry>
        {
            public BitrateLogEntry(long timeStamp, IManifestTrack track)
            {
                TimeStamp = timeStamp;
                Track = track;
            }

            public long TimeStamp { get; private set; }
            public IManifestTrack Track { get; private set; }

            public int CompareTo(BitrateLogEntry other)
            {
                return TimeStamp.CompareTo(other.TimeStamp);
            }
        }

#if SILVERLIGHT
        public event EventHandler StateChanged;
#else
        public event EventHandler<object> StateChanged;
#endif

        public uint? StartupBitrate { get; set; }

        public uint? MaxBitrate
        {
            get { return maxBitrate; }
            set
            {
                maxBitrate = value;
                lock (adaptiveSourceLock)
                {
                    if (IsOpen)
                    {
                        UpdateSelectedTracks();
                    }
                }
            }
        }

        public uint? MinBitrate
        {
            get { return minBitrate; }
            set
            {
                minBitrate = value;
                lock (adaptiveSourceLock)
                {
                    if (IsOpen)
                    {
                        UpdateSelectedTracks();
                    }
                }
            }
        }

        public Size? MaxSize
        {
            get { return maxSize; }
            set
            {
                maxSize = value;
                lock (adaptiveSourceLock)
                {
                    if (IsOpen)
                    {
                        UpdateSelectedTracks();
                    }
                }
            }
        }

        private void UpdateSelectedTracks(uint? preferredBitrate = null)
        {
            var videoStream = VideoStream;
            if (videoStream != null && videoStream.AvailableTracks.Any())
            {
                IList<IManifestTrack> tracks = videoStream.AvailableTracks.ToList();
                if (MaxSize.HasValue)
                {
                    tracks = tracks.Where(t => t.MaxWidth <= MaxSize.Value.Width && t.MaxHeight <= MaxSize.Value.Height).ToList();
                }
                if (MaxBitrate.HasValue)
                {
                    tracks = tracks.Where(t => t.Bitrate <= MaxBitrate.Value).ToList();
                }
                if (MinBitrate.HasValue)
                {
                    tracks = tracks.Where(t => t.Bitrate >= MinBitrate.Value).ToList();
                }
                if (!tracks.Any())
                {
                    // there are no tracks this small. Instead take the smallest ones (note: there can be more than one at the same size)
                    tracks = videoStream.AvailableTracks.GroupBy(t => t.MaxWidth * t.MaxHeight).OrderBy(g => g.Key).First().ToList();
                }
                if (preferredBitrate.HasValue)
                {
                    tracks = tracks.OrderBy(t => Math.Abs((long)t.Bitrate - (long)preferredBitrate.Value)).Take(1).ToList();
                }
                isStartupBitrateActive = false;
                if (!videoStream.SelectedTracks.SequenceEqual(tracks, manifestTrackEqualityComparer))
                {
                    videoStream.SelectTracks(new ReadOnlyCollection<IManifestTrack>(tracks));
                    isStartupBitrateActive = preferredBitrate.HasValue; // causes an UpdateSelectedTracks call to be made immediately after playback starts.
                }
            }
        }

        private static ManifestTrackEqualityComparer manifestTrackEqualityComparer = new ManifestTrackEqualityComparer();

        class ManifestTrackEqualityComparer : IEqualityComparer<IManifestTrack>
        {
            public bool Equals(IManifestTrack x, IManifestTrack y)
            {
                return x.TrackIndex == y.TrackIndex;
            }

            public int GetHashCode(IManifestTrack obj)
            {
                return obj.TrackIndex.GetHashCode();
            }
        }

        #endregion

        #region Captions
        public IReadOnlyList<AdaptiveCaptionStream> AvailableCaptionStreams { get; private set; }

        static bool IsCaptionStream(IManifestStream stream)
        {
            return stream.Type == MediaStreamType.Text && (stream.SubType == "CAPT" || stream.SubType == "SUBT");
        }

        public AdaptiveCaptionStream SelectedCaptionStream
        {
            get
            {
                lock (adaptiveSourceLock)
                {
                    if (IsManifestReady)
                    {
                        var selectedStream = ActiveAdaptiveSource.Manifest.SelectedStreams.FirstOrDefault(IsCaptionStream);
                        if (selectedStream != null)
                        {
                            return AvailableCaptionStreams.FirstOrDefault(s => s.ManifestStream.Name == selectedStream.Name);
                        }
                    }
                    return null;
                }
            }
            set
            {
                lock (adaptiveSourceLock)
                {
                    if (IsManifestReady)
                    {
                        var selectedStreams = ActiveAdaptiveSource.Manifest.SelectedStreams.ToList();
                        var oldCaptionStream = selectedStreams.FirstOrDefault(IsCaptionStream);
                        if (oldCaptionStream != null)
                        {
                            selectedStreams.Remove(oldCaptionStream);
                        }
                        var newCaptionStream = value != null ? ActiveAdaptiveSource.Manifest.AvailableStreams.FirstOrDefault(s => s.Name == value.ManifestStream.Name) : null;
                        if (newCaptionStream != null)
                        {
                            selectedStreams.Add(newCaptionStream);
                        }
                        if (newCaptionStream != oldCaptionStream)
                        {
                            // run on background thread since this can block UI thread
                            var selectionOperation = Task.Run(() => ActiveAdaptiveSource.Manifest.SelectStreamsAsync(selectedStreams).AsTask());
                            if (IsIsmtEnabled)
                            {
                                selectionOperation.ContinueWith(t => PollIsmtAsync(newCaptionStream));
                            }
                        }
                    }
                }
            }
        }

        private async Task PollIsmtAsync(IManifestStream stream)
        {
            lock (fragmentPollingLock)
            {
                if (fragmentCancellationTokenSource != null) fragmentCancellationTokenSource.Cancel();
            }

            if (stream != null)
            {
                // start downloading chunks
                using (var cts = CancellationTokenSource.CreateLinkedTokenSource(mainCancellationTokenSource.Token))
                {
                    lock (fragmentPollingLock)
                    {
                        fragmentCancellationTokenSource = cts;
                    }
                    try
                    {
                        cts.Token.ThrowIfCancellationRequested();

                        var captionTrack = stream.AvailableTracks.FirstOrDefault();
                        if (captionTrack != null)
                        {
                            await PollFragmentsAsync(stream, captionTrack, cts.Token);
                        }
                    }
                    catch (OperationCanceledException) { /* ignore */ }
                    lock (fragmentPollingLock)
                    {
                        fragmentCancellationTokenSource = null;
                    }
                }
            }
        }
        #endregion

        #region Fragments

        private async Task PollFragmentsAsync(IManifestStream stream, IManifestTrack track, CancellationToken cancellationToken)
        {
            try
            {
                var iter = stream.FirstInCurrentChunkList;

                var finished = false;
                ChunkInfo? chunkInfo = await stream.GetChunkInfoAsync(iter);
                cancellationToken.ThrowIfCancellationRequested();
                do
                {
                    try
                    {
                        // add small artificial delay if chunk is more than 1 minute away so we don't hog bandwidth
                        if (chunkInfo.Value.ChunkTime > Position.Add(TimeSpan.FromMinutes(1)).Ticks)
                        {
                            await Task.Delay(ChunkCachePollingIntervalMilliseconds, cancellationToken);
                        }

                        var chunkData = (await stream.GetChunkDataAsync(iter, track)).ToArray();
                        cancellationToken.ThrowIfCancellationRequested();

                        var currentChunkInfo = chunkInfo.Value;

                        if (iter.MoveNext())
                        {
                            chunkInfo = await stream.GetChunkInfoAsync(iter);
                            cancellationToken.ThrowIfCancellationRequested();
                        }
                        else
                        {
                            chunkInfo = null;
                            finished = true;
                        }

                        OnDataReceived(new DataReceivedEventArgs(chunkData, currentChunkInfo.ChunkTime, chunkInfo.HasValue ? chunkInfo.Value.ChunkTime : ActiveAdaptiveSource.Manifest.Duration, stream, track));

                        if (finished && IsLive) // for live situations, we need to keep checking
                        {
                            do
                            {
                                await Task.Delay(ChunkLivePollingIntervalMilliseconds, cancellationToken); // wait 1 second before checking again
                                finished = !IsLive; // recheck in case EndOfLive occurred
                            } while (!finished && !iter.MoveNext());
                            if (!finished)
                            {
                                chunkInfo = await stream.GetChunkInfoAsync(iter);
                                cancellationToken.ThrowIfCancellationRequested();
                            }
                        }
                    }
                    catch (OperationCanceledException) { throw; }
                    catch (Exception ex) { OnDataError(new DataErrorEventArgs(ex, stream, track)); }
                } while (!finished);
            }
            catch (OperationCanceledException) { throw; }
            catch (Exception ex) { OnDataError(new DataErrorEventArgs(ex, stream, track)); }
        }

        private async void OnDataError(DataErrorEventArgs args)
        {
            if (dispatcher != null)
            {
                await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
                {
                    if (DataError != null) DataError(this, args);
                });
            }
        }

        private async void OnDataReceived(DataReceivedEventArgs args)
        {
            if (dispatcher != null)
            {
                await dispatcher.RunAsync(CoreDispatcherPriority.Normal, () =>
                {
                    if (DataReceived != null) DataReceived(this, args);
                });
            }
        }
        #endregion
    }

    public sealed class RefreshingStateEventArgs
    {
        internal RefreshingStateEventArgs(TimeSpan position)
        {
            Position = position;
        }

        public TimeSpan Position { get; private set; }
    }

    public sealed class DataReceivedEventArgs
    {
        internal DataReceivedEventArgs(byte[] data, long startTime, long endTime, IManifestStream stream, IManifestTrack track)
        {
            StartTime = startTime;
            EndTime = endTime;
            Data = data;
            Stream = stream;
            Track = track;
        }

        public IManifestStream Stream { get; private set; }
        public IManifestTrack Track { get; private set; }
        public long StartTime { get; private set; }
        public long EndTime { get; private set; }
        public byte[] Data { get; private set; }
    }

    public sealed class DataErrorEventArgs
    {
        internal DataErrorEventArgs(Exception error, IManifestStream stream, IManifestTrack track)
        {
            Error = error;
            Stream = stream;
            Track = track;
        }

        public IManifestStream Stream { get; private set; }
        public IManifestTrack Track { get; private set; }
        public Exception Error { get; private set; }
    }
}