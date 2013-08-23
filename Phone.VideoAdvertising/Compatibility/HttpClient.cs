﻿using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;

namespace System.Net.Http
{
    /// <summary>
    /// Used for compatibility with Win8
    /// </summary>
    internal class HttpClient : IDisposable
    {
        public string UserAgent { get; set; }

        public async Task<Stream> GetStreamAsync(Uri address)
        {
            var request = WebRequest.CreateHttp(address);
            if (UserAgent != null) request.UserAgent = UserAgent;
            request.AllowReadStreamBuffering = true;
            var response = await Task.Factory.FromAsync<WebResponse>(request.BeginGetResponse, request.EndGetResponse, null);
            return response.GetResponseStream();
        }

        public void Dispose()
        {
            // do nothing, just here for backward compatibility
        }
    }
}
