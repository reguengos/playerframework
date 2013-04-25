@pushd %~dp0%

cd..

copyencoded Win8.Js\css\Default-base.css+Win8.Js\css\Default-dark.css																									Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-dark.css
copyencoded Win8.Js\css\Default-base.css+Win8.Js\css\Default-light.css																									Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-light.css
copyencoded Win8.Js\css\Default-base.css+Win8.Js\css\Default-dark.css+Win8.Js\css\Entertainment-base.css+Win8.Js\css\Entertainment-dark.css								Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-Entertainment-dark.css
copyencoded Win8.Js\css\Default-base.css+Win8.Js\css\Default-light.css+Win8.Js\css\Entertainment-base.css+Win8.Js\css\Entertainment-light.css							Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-Entertainment-light.css
copyencoded Win8.Js\js\PlayerFramework.js+Win8.Js\js\InteractiveViewModel.js+Win8.Js\js\MediaPlayer.js+Win8.Js\js\DynamicTextTrack.js+Win8.Js\js\ui\Button.js+Win8.Js\js\ui\ControlPanel.js+Win8.Js\js\ui\Indicator.js+Win8.Js\js\ui\Meter.js+Win8.Js\js\ui\Slider.js+Win8.Js\js\plugins\PluginBase.js+Win8.Js\js\plugins\TrackingPluginBase.js+Win8.Js\js\plugins\BufferingPlugin.js+Win8.Js\js\plugins\ControlPlugin.js+Win8.Js\js\plugins\ErrorPlugin.js+Win8.Js\js\plugins\LoaderPlugin.js+Win8.Js\js\plugins\PlaylistPlugin.js+Win8.Js\js\plugins\PlayTimeTrackingPlugin.js+Win8.Js\js\plugins\PositionTrackingPlugin.js+Win8.Js\js\plugins\MediaControlPlugin.js Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\js\PlayerFramework.js
copy Win8.Js\images\thumb-dark.png																																		Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\images\
copy Win8.Js\images\thumb-light.png																																		Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\images\
copy Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-dark.css									Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\
copy Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-light.css								Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\
copy Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-Entertainment-dark.css					Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\
copy Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\PlayerFramework-Entertainment-light.css					Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\css\
copy Build\Microsoft.PlayerFramework.Js\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\js\PlayerFramework.js										Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\js\
copy Win8.Js\bin\Release\Microsoft.PlayerFramework.Js.pri																												Build\Microsoft.PlayerFramework.Js\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js\
@rem copy Win8.Js\bin\Release\Microsoft.PlayerFramework.Js.winmd																										Build\Microsoft.PlayerFramework.Js\References\CommonConfiguration\neutral\

copyencoded Win8.Js.Adaptive\js\AdaptivePlugin.js																														Build\Microsoft.PlayerFramework.Js.Adaptive\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Adaptive\js\PlayerFramework.Adaptive.js
copy Build\Microsoft.PlayerFramework.Js.Adaptive\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Adaptive\js\PlayerFramework.Adaptive.js				Build\Microsoft.PlayerFramework.Js.Adaptive\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Adaptive\js\
copy Win8.Js.Adaptive\bin\x86\Release\Microsoft.PlayerFramework.Js.Adaptive.pri																							Build\Microsoft.PlayerFramework.Js.Adaptive\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Adaptive\
copy Win8.AdaptiveStreaming\bin\x86\Release\Microsoft.AdaptiveStreaming.pri																								Build\Microsoft.PlayerFramework.Js.Adaptive\Redist\CommonConfiguration\neutral\Microsoft.AdaptiveStreaming\
copy Win8.Js.Adaptive\bin\x86\Release\Microsoft.PlayerFramework.Js.Adaptive.winmd																						Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x86\
@rem copy Win8.Js.Adaptive\bin\x86\Release\Microsoft.PlayerFramework.Js.Adaptive.xml 																					Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x86\
copy Win8.AdaptiveStreaming\bin\x86\Release\Microsoft.AdaptiveStreaming.winmd																							Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x86\
copy Win8.Js.Adaptive\bin\x64\Release\Microsoft.PlayerFramework.Js.Adaptive.winmd																						Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x64\
@rem copy Win8.Js.Adaptive\bin\x64\Release\Microsoft.PlayerFramework.Js.Adaptive.xml 																					Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x64\
copy Win8.AdaptiveStreaming\bin\x64\Release\Microsoft.AdaptiveStreaming.winmd																							Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\x64\
copy Win8.Js.Adaptive\bin\ARM\Release\Microsoft.PlayerFramework.Js.Adaptive.winmd																						Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\ARM\
@rem copy Win8.Js.Adaptive\bin\ARM\Release\Microsoft.PlayerFramework.Js.Adaptive.xml 																					Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\ARM\
copy Win8.AdaptiveStreaming\bin\ARM\Release\Microsoft.AdaptiveStreaming.winmd																							Build\Microsoft.PlayerFramework.Js.Adaptive\References\CommonConfiguration\ARM\

copyencoded Win8.Js.Advertising\css\Advertising.css																														Build\Microsoft.PlayerFramework.Js.Advertising\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\css\PlayerFramework.Advertising.css
copyencoded Win8.Js.Advertising\js\AdHandlerPlugin.js+Win8.Js.Advertising\js\AdPayloadHandlerPluginBase.js+Win8.Js.Advertising\js\AdPlayerFactoryPluginBase.js+Win8.Js.Advertising\js\AdPlayerFactoryPlugin.js+Win8.Js.Advertising\js\AdSchedulerPlugin.js+Win8.Js.Advertising\js\Advertisement.js+Win8.Js.Advertising\js\FreeWheelPlugin.js+Win8.Js.Advertising\js\MastSchedulerPlugin.js+Win8.Js.Advertising\js\MediaPlayerAdapter.js+Win8.Js.Advertising\js\VmapSchedulerPlugin.js+Win8.Js.Advertising\js\VpaidAdPlayerBase.js+Win8.Js.Advertising\js\VpaidNonLinearAdPlayers.js+Win8.Js.Advertising\js\VpaidVideoAdPlayer.js+Win8.Js.Advertising\js\VpaidAdapter.js+Win8.Js.Advertising\js\VpaidLinearAdViewModel.js+Win8.Js.Advertising\js\VpaidNonLinearAdViewModel.js Build\Microsoft.PlayerFramework.Js.Advertising\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\js\PlayerFramework.Advertising.js
copy Build\Microsoft.PlayerFramework.Js.Advertising\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\css\PlayerFramework.Advertising.css	Build\Microsoft.PlayerFramework.Js.Advertising\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\css\
copy Build\Microsoft.PlayerFramework.Js.Advertising\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\js\PlayerFramework.Advertising.js	Build\Microsoft.PlayerFramework.Js.Advertising\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\js\
copy Win8.Js.Advertising\bin\Release\Microsoft.PlayerFramework.Js.Advertising.pri																						Build\Microsoft.PlayerFramework.Js.Advertising\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Advertising\
copy Win8.VideoAdvertising\bin\Release\Microsoft.VideoAdvertising.pri																									Build\Microsoft.PlayerFramework.Js.Advertising\Redist\CommonConfiguration\neutral\Microsoft.VideoAdvertising\
copy Win8.VideoAdvertising\bin\Release\Microsoft.VideoAdvertising.winmd																									Build\Microsoft.PlayerFramework.Js.Advertising\References\CommonConfiguration\neutral\
copy Win8.Js.Advertising\bin\Release\Microsoft.PlayerFramework.Js.Advertising.winmd																						Build\Microsoft.PlayerFramework.Js.Advertising\References\CommonConfiguration\neutral\
copy Win8.Js.Advertising\bin\Release\Microsoft.PlayerFramework.Js.Advertising.xml 																						Build\Microsoft.PlayerFramework.Js.Advertising\References\CommonConfiguration\neutral\
copyencoded Win8.Js.TimedText\css\TimedText.css																															Build\Microsoft.PlayerFramework.Js.TimedText\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\css\PlayerFramework.TimedText.css
copyencoded Win8.Js.TimedText\js\CaptionsPlugin.js+Win8.Js.TimedText\js\TtmlParser.js																					Build\Microsoft.PlayerFramework.Js.TimedText\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\js\PlayerFramework.TimedText.js
copy Build\Microsoft.PlayerFramework.Js.TimedText\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\css\PlayerFramework.TimedText.css		Build\Microsoft.PlayerFramework.Js.TimedText\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\css\
copy Build\Microsoft.PlayerFramework.Js.TimedText\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\js\PlayerFramework.TimedText.js			Build\Microsoft.PlayerFramework.Js.TimedText\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\js\
copy Win8.Js.TimedText\bin\Release\Microsoft.PlayerFramework.Js.TimedText.pri																							Build\Microsoft.PlayerFramework.Js.TimedText\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.TimedText\
@rem copy Win8.Js.TimedText\bin\Release\Microsoft.PlayerFramework.Js.TimedText.winmd																					Build\Microsoft.PlayerFramework.Js.TimedText\References\CommonConfiguration\neutral\

copyencoded Win8.Js.Analytics\js\ErrorLogger.js+Win8.Js.Analytics\js\MediaPlayerAdapter.js+Win8.Js.Analytics\js\AdaptiveAnalyticsPlugin.js+Win8.Js.Analytics\js\AnalyticsPlugin.js	Build\Microsoft.PlayerFramework.Js.Analytics\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Analytics\js\PlayerFramework.Analytics.js
copy Build\Microsoft.PlayerFramework.Js.Analytics\DesignTime\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Analytics\js\PlayerFramework.Analytics.js						Build\Microsoft.PlayerFramework.Js.Analytics\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Analytics\js\
copy Win8.Js.Analytics\bin\Release\Microsoft.PlayerFramework.Js.Analytics.pri																										Build\Microsoft.PlayerFramework.Js.Analytics\Redist\CommonConfiguration\neutral\Microsoft.PlayerFramework.Js.Analytics\
copy Win8.VideoAnalytics\bin\Release\Microsoft.VideoAnalytics.pri																													Build\Microsoft.PlayerFramework.Js.Analytics\Redist\CommonConfiguration\neutral\Microsoft.VideoAnalytics\
copy Win8.VideoAnalytics\bin\Release\Microsoft.VideoAnalytics.winmd																													Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\neutral\
copy Win8.VideoAnalytics\bin\Release\Microsoft.VideoAnalytics.xml																													Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\neutral\
copy Win8.Js.Analytics\bin\Release\Microsoft.PlayerFramework.Js.Analytics.winmd																										Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\neutral\
copy Win8.Js.Analytics\bin\Release\Microsoft.PlayerFramework.Js.Analytics.xml 																										Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\neutral\
copy Win8.AdaptiveStreaming.Analytics\bin\x86\Release\Microsoft.AdaptiveStreaming.Analytics.pri																						Build\Microsoft.PlayerFramework.Js.Analytics\Redist\CommonConfiguration\neutral\Microsoft.AdaptiveStreaming.Analytics\
copy Win8.AdaptiveStreaming.Analytics\bin\x86\Release\Microsoft.AdaptiveStreaming.Analytics.winmd																					Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\x86\
copy Win8.AdaptiveStreaming.Analytics\bin\x64\Release\Microsoft.AdaptiveStreaming.Analytics.winmd																					Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\x64\
copy Win8.AdaptiveStreaming.Analytics\bin\ARM\Release\Microsoft.AdaptiveStreaming.Analytics.winmd																					Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\ARM\
copy Lib\Portable\ZLib\bin\Release\ZLib.dll																																			Build\Microsoft.PlayerFramework.Js.Analytics\References\CommonConfiguration\neutral\

@popd

@echo.
@echo Done.
@echo.
@pause
