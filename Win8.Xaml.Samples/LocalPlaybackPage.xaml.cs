﻿using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.Media.Capture;
using Windows.Storage.Pickers;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

// The Basic Page item template is documented at http://go.microsoft.com/fwlink/?LinkId=234237

namespace Microsoft.PlayerFramework.Samples
{
    /// <summary>
    /// A basic page that provides characteristics common to most applications.
    /// </summary>
    public sealed partial class LocalPlaybackPage : Microsoft.PlayerFramework.Samples.Common.LayoutAwarePage
    {
        public LocalPlaybackPage()
        {
            this.InitializeComponent();
        }

        private async void OpenFile_Click(object sender, RoutedEventArgs e)
        {
            FileOpenPicker openPicker = new FileOpenPicker();
            openPicker.SuggestedStartLocation = PickerLocationId.VideosLibrary;
            openPicker.FileTypeFilter.Add(".mp4");
            openPicker.FileTypeFilter.Add(".wmv");
            var file = await openPicker.PickSingleFileAsync();
            if (file != null)
            {
                var fileStream = await file.OpenAsync(Windows.Storage.FileAccessMode.Read);
                player.SetSource(fileStream, file.FileType);
            }
        }

        protected override void OnNavigatedFrom(NavigationEventArgs e)
        {
            player.Dispose();
            base.OnNavigatedFrom(e);
        }

        private async void OpenWebcam_Click(object sender, RoutedEventArgs e)
        {
            CameraCaptureUI dialog = new CameraCaptureUI();
            dialog.VideoSettings.Format = CameraCaptureUIVideoFormat.Mp4;

            var file = await dialog.CaptureFileAsync(CameraCaptureUIMode.Video);
            if (file != null)
            {
                var fileStream = await file.OpenAsync(Windows.Storage.FileAccessMode.Read);
                player.SetSource(fileStream, file.FileType);
            }
        }
    }
}
