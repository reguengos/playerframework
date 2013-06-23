﻿using System;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Microsoft.AdaptiveStreaming.Dash
{
    internal static class WebRequestor
    {
        public static async Task<long> GetFileSizeAsync(Uri uri)
        {
            using (var httpClient = new HttpClient())
            {
                using (HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Head, uri))
                {
                    using (HttpResponseMessage response = await httpClient.SendAsync(request))
                    {
                        if (response.IsSuccessStatusCode)
                        {
                            return response.Content.Headers.ContentLength.GetValueOrDefault(0);
                        }
                        else
                        {
                            throw new WebRequestorFailure(response.StatusCode, response.Headers);
                        }
                    }
                }
            }
        }

        public static async Task<Stream> GetStreamRangeAsync(Uri uri, Range range)
        {
            using (var httpClient = new HttpClient())
            {
                if (range != null)
                {
                    if (range.From.HasValue) httpClient.AddRange((long)range.From.Value, (long)range.To.Value);
                    else if (range.To.HasValue) httpClient.AddRange((long)range.To.Value);
                }
                return (await httpClient.GetResponse(uri)).Stream;
            }
        }

        public static async Task<Stream> GetStreamRangeAsync(Uri uri, long from, long to)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.AddRange(from, to);
                return (await httpClient.GetResponse(uri)).Stream;
            }
        }

        public static async Task<Stream> GetStreamRangeAsync(Uri uri, long range)
        {
#if RANGE_SUFFIX_NOTSUPPORTED
            if (range < 0)
            {
                // not all backend services support range suffixes. For example, Azure Blobs. Here is a way around this but it requires an extra request to get the length and therefore does not perform as well.
                var size = await GetFileSizeAsync(uri);
                return await GetStreamRangeAsync(uri, size + range, size);
            }
            else
#endif
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.AddRange(range);
                    return (await httpClient.GetResponse(uri)).Stream;
                }
            }
        }

        public static async Task<WebRequestorResponse> GetResponseAsync(Uri uri)
        {
            using (var httpClient = new HttpClient())
            {
                return await httpClient.GetResponse(uri);
            }
        }

        public static async Task<WebRequestorResponse> GetResponseAsync(Uri uri, long from, long to)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.AddRange(from, to);
                return await httpClient.GetResponse(uri);
            }
        }

        public class Range
        {
            public Range(ulong? from, ulong? to)
            {
                From = from;
                To = to;
            }

            public ulong? From { get; set; }
            public ulong? To { get; set; }

            public static Range FromString(string rangeString)
            {
                if (string.IsNullOrEmpty(rangeString)) return null;
                var range = rangeString.Split('-').Select(r => ulong.Parse(r)).ToArray();
                return new Range(range[0], range[1]);
            }
        }
    }
}
