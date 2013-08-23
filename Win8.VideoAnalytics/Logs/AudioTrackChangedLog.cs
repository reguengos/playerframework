﻿using System;
using System.Collections.Generic;

namespace Microsoft.VideoAnalytics
{
    /// <summary>
    /// A log generated when the currently selected audio track changes.
    /// </summary>
    public sealed class AudioTrackChangedLog : ILog
    {
        /// <summary>
        /// Creates a new instance of AudioTrackChangedLog.
        /// </summary>
        /// <param name="trackId">The ID of the track</param>
        public AudioTrackChangedLog(string trackId)
        {
            TimeStamp = DateTimeOffset.Now;
            Type = EventTypes.AudioTrackChanged;
            TrackId = trackId;
            Id = Guid.NewGuid();
            ExtraData = new Dictionary<string, object>();
        }

        /// <inheritdoc /> 
        public IDictionary<string, object> ExtraData { get; private set; }

        /// <inheritdoc /> 
        public Guid Id { get; set; }

        /// <inheritdoc /> 
        public DateTimeOffset TimeStamp { get; set; }

        /// <inheritdoc /> 
        public string Type { get; private set; }

        /// <inheritdoc /> 
        public IDictionary<string, object> GetData()
        {
            var result = this.CreateBasicLogData();
            result.Add("Language", TrackId);
            return result;
        }

        /// <summary>
        /// Gets the language ID of the caption selection event. Null if no caption was set.
        /// </summary>
        public string TrackId { get; private set; }
    }
}
