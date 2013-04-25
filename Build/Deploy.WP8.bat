@pushd %~dp0%

cd..

copy Phone.SL\bin\Release\Microsoft.PlayerFramework.dll  Build\Microsoft.PlayerFramework.WP8\References\CommonConfiguration\neutral\
copy Phone.SL\bin\Release\Microsoft.PlayerFramework.xml  Build\Microsoft.PlayerFramework.WP8\References\CommonConfiguration\neutral\

copy Phone.SL.Adaptive\bin\Release\Microsoft.PlayerFramework.Adaptive.dll  Build\Microsoft.PlayerFramework.WP8.Adaptive\References\CommonConfiguration\neutral\
copy Phone.SL.Adaptive\bin\Release\Microsoft.PlayerFramework.Adaptive.xml  Build\Microsoft.PlayerFramework.WP8.Adaptive\References\CommonConfiguration\neutral\

copy Phone.SL.TimedText\bin\Release\Microsoft.PlayerFramework.TimedText.dll  Build\Microsoft.PlayerFramework.WP8.TimedText\References\CommonConfiguration\neutral\
copy Phone.TimedText\bin\Release\Microsoft.TimedText.dll					 Build\Microsoft.PlayerFramework.WP8.TimedText\References\CommonConfiguration\neutral\

copy Phone.SL.Advertising\bin\Release\Microsoft.PlayerFramework.Advertising.dll  Build\Microsoft.PlayerFramework.WP8.Advertising\References\CommonConfiguration\neutral\
copy Phone.VideoAdvertising\bin\Release\Microsoft.VideoAdvertising.dll			 Build\Microsoft.PlayerFramework.WP8.Advertising\References\CommonConfiguration\neutral\

copy Phone.SL.Analytics\bin\Release\Microsoft.PlayerFramework.Analytics.dll					      Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\
copy Phone.SL.Analytics\bin\Release\Microsoft.PlayerFramework.Analytics.xml					      Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\
copy Phone.SL.Adaptive.Analytics\bin\Release\Microsoft.PlayerFramework.Adaptive.Analytics.dll     Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\
copy Phone.VideoAnalytics\bin\Release\Microsoft.VideoAnalytics.dll								  Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\
copy Phone.VideoAnalytics\bin\Release\Microsoft.VideoAnalytics.xml								  Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\
copy Lib\Portable\ZLib\bin\Release\ZLib.dll														  Build\Microsoft.PlayerFramework.WP8.Analytics\References\CommonConfiguration\neutral\

copy Phone.SL.WebVTT\bin\Release\Microsoft.PlayerFramework.WebVTT.dll  Build\Microsoft.PlayerFramework.WP8.WebVTT\References\CommonConfiguration\neutral\
copy Phone.WebVTT\bin\Release\Microsoft.WebVTT.dll					 Build\Microsoft.PlayerFramework.WP8.WebVTT\References\CommonConfiguration\neutral\

@popd

@echo.
@echo Done.
@echo.
@pause
