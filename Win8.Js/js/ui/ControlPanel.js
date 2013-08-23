﻿(function (PlayerFramework, undefined) {
    "use strict";

    // ControlPanel Errors
    var invalidConstruction = "Invalid construction: ControlPanel constructor must be called using the \"new\" operator.",
        invalidElement = "Invalid argument: ControlPanel expects an element as the first argument.";

    // ControlPanel Class
    var ControlPanel = WinJS.Class.define(function (element, options) {
        if (!(this instanceof PlayerFramework.UI.ControlPanel)) {
            throw invalidConstruction;
        }

        if (!element) {
            throw invalidElement;
        }

        this._element = null;
        this._playPauseElement = null;
        this._playResumeElement = null;
        this._pauseElement = null;
        this._replayElement = null;
        this._rewindElement = null;
        this._fastForwardElement = null;
        this._slowMotionElement = null;
        this._skipPreviousElement = null;
        this._skipNextElement = null;
        this._skipBackElement = null;
        this._skipAheadElement = null;
        this._elapsedTimeElement = null;
        this._remainingTimeElement = null;
        this._timelineElement = null;
        this._goLiveElement = null;
        this._captionsElement = null;
        this._audioElement = null;
        this._volumeMuteContainerElement = null;
        this._volumeMuteElement = null;
        this._volumeMuteSliderElement = null;
        this._volumeElement = null;
        this._muteElement = null;
        this._fullScreenElement = null;
        this._signalStrengthElement = null;
        this._mediaQualityElement = null;

        this._flyoutContainerElement = null;
        this._captionsMenuElement = null;
        this._audioMenuElement = null;
        this._volumeFlyoutElement = null;

        this._setElement(element);
        this._setOptions(options);
    }, {
        // Public Properties
        element: {
            get: function () {
                return this._element;
            }
        },

        hidden: {
            get: function () {
                return WinJS.Utilities.hasClass(this._element, "pf-hidden");
            },
            set: function (value) {
                if (value) {
                    WinJS.Utilities.addClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", true);
                } else {
                    WinJS.Utilities.removeClass(this._element, "pf-hidden");
                    this._element.setAttribute("aria-hidden", false);
                }
            }
        },

        isPlayPauseHidden: {
            get: function () {
                return this._playPauseElement.winControl.hidden;
            },
            set: function (value) {
                this._playPauseElement.winControl.hidden = value;
            }
        },

        isPlayResumeHidden: {
            get: function () {
                return this._playResumeElement.winControl.hidden;
            },
            set: function (value) {
                this._playResumeElement.winControl.hidden = value;
            }
        },

        isPauseHidden: {
            get: function () {
                return this._pauseElement.winControl.hidden;
            },
            set: function (value) {
                this._pauseElement.winControl.hidden = value;
            }
        },

        isReplayHidden: {
            get: function () {
                return this._replayElement.winControl.hidden;
            },
            set: function (value) {
                this._replayElement.winControl.hidden = value;
            }
        },

        isRewindHidden: {
            get: function () {
                return this._rewindElement.winControl.hidden;
            },
            set: function (value) {
                this._rewindElement.winControl.hidden = value;
            }
        },

        isFastForwardHidden: {
            get: function () {
                return this._fastForwardElement.winControl.hidden;
            },
            set: function (value) {
                this._fastForwardElement.winControl.hidden = value;
            }
        },

        isSlowMotionHidden: {
            get: function () {
                return this._slowMotionElement.winControl.hidden;
            },
            set: function (value) {
                this._slowMotionElement.winControl.hidden = value;
            }
        },

        isSkipPreviousHidden: {
            get: function () {
                return this._skipPreviousElement.winControl.hidden;
            },
            set: function (value) {
                this._skipPreviousElement.winControl.hidden = value;
            }
        },

        isSkipNextHidden: {
            get: function () {
                return this._skipNextElement.winControl.hidden;
            },
            set: function (value) {
                this._skipNextElement.winControl.hidden = value;
            }
        },

        isSkipBackHidden: {
            get: function () {
                return this._skipBackElement.winControl.hidden;
            },
            set: function (value) {
                this._skipBackElement.winControl.hidden = value;
            }
        },

        isSkipAheadHidden: {
            get: function () {
                return this._skipAheadElement.winControl.hidden;
            },
            set: function (value) {
                this._skipAheadElement.winControl.hidden = value;
            }
        },

        isElapsedTimeHidden: {
            get: function () {
                return this._elapsedTimeElement.winControl.hidden;
            },
            set: function (value) {
                this._elapsedTimeElement.winControl.hidden = value;
            }
        },

        isRemainingTimeHidden: {
            get: function () {
                return this._remainingTimeElement.winControl.hidden;
            },
            set: function (value) {
                this._remainingTimeElement.winControl.hidden = value;
            }
        },

        isTimelineHidden: {
            get: function () {
                return this._timelineElement.winControl.hidden;
            },
            set: function (value) {
                this._timelineElement.winControl.hidden = value;
            }
        },

        isGoLiveHidden: {
            get: function () {
                return this._goLiveElement.winControl.hidden;
            },
            set: function (value) {
                this._goLiveElement.winControl.hidden = value;
            }
        },

        isCaptionsHidden: {
            get: function () {
                return this._captionsElement.winControl.hidden;
            },
            set: function (value) {
                this._captionsElement.winControl.hidden = value;
            }
        },

        isAudioHidden: {
            get: function () {
                return this._audioElement.winControl.hidden;
            },
            set: function (value) {
                this._audioElement.winControl.hidden = value;
            }
        },

        isVolumeMuteHidden: {
            get: function () {
                return this._volumeMuteElement.winControl.hidden;
            },
            set: function (value) {
                this._volumeMuteElement.winControl.hidden = value;
                this._volumeMuteContainerElement.style.display = value ? "none" : "";
            }
        },

        isVolumeHidden: {
            get: function () {
                return this._volumeElement.winControl.hidden;
            },
            set: function (value) {
                this._volumeElement.winControl.hidden = value;
            }
        },

        isMuteHidden: {
            get: function () {
                return this._muteElement.winControl.hidden;
            },
            set: function (value) {
                this._muteElement.winControl.hidden = value;
            }
        },

        isFullScreenHidden: {
            get: function () {
                return this._fullScreenElement.winControl.hidden;
            },
            set: function (value) {
                this._fullScreenElement.winControl.hidden = value;
            }
        },

        isSignalStrengthHidden: {
            get: function () {
                return this._signalStrengthElement.winControl.hidden;
            },
            set: function (value) {
                this._signalStrengthElement.winControl.hidden = value;
            }
        },

        isMediaQualityHidden: {
            get: function () {
                return this._mediaQualityElement.winControl.hidden;
            },
            set: function (value) {
                this._mediaQualityElement.winControl.hidden = value;
            }
        },

        flyoutContainerElement: {
            get: function () {
                return this._flyoutContainerElement;
            },
            set: function (value) {
                if (this._flyoutContainerElement) {
                    this._captionsElement.winControl.flyout = null;
                    this._audioElement.winControl.flyout = null;
                    this._volumeElement.winControl.flyout = null;

                    PlayerFramework.Utilities.removeElement(this._captionsMenuElement);
                    PlayerFramework.Utilities.removeElement(this._audioMenuElement);
                    PlayerFramework.Utilities.removeElement(this._volumeFlyoutElement);
                }

                this._flyoutContainerElement = value;

                if (this._flyoutContainerElement) {
                    this._captionsMenuElement = PlayerFramework.Utilities.createElement(this._flyoutContainerElement, ["div", { "class": "pf-captions-menu", "data-win-control": "WinJS.UI.Menu", "data-win-bind": "winControl.onbeforeshow: onCaptionsMenuBeforeShow PlayerFramework.Binding.setEventHandler;" }]);
                    this._audioMenuElement = PlayerFramework.Utilities.createElement(this._flyoutContainerElement, ["div", { "class": "pf-audio-menu", "data-win-control": "WinJS.UI.Menu", "data-win-bind": "winControl.onbeforeshow: onAudioMenuBeforeShow PlayerFramework.Binding.setEventHandler;" }]);
                    this._volumeFlyoutElement = PlayerFramework.Utilities.createElement(this._flyoutContainerElement, ["div", { "class": "pf-volume-flyout", "data-win-control": "WinJS.UI.Flyout" }, ["button", { "type": "button", "class": "pf-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: muteIcon; winControl.label: muteLabel; winControl.tooltip: muteTooltip; winControl.disabled: isMuteDisabled; winControl.onclick: toggleMuted PlayerFramework.Binding.setEventHandler;" }], ["hr"], ["div", { "class": "pf-volume-slider-control", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: volume; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeDisabled; winControl.onupdate: onVolumeSliderUpdate PlayerFramework.Binding.setEventHandler;", "data-win-options": "{ altStep1: 5, vertical: true }" }]]);

                    WinJS.UI.processAll(this._flyoutContainerElement);

                    this._captionsElement.winControl.flyout = this._captionsMenuElement.winControl;
                    this._audioElement.winControl.flyout = this._audioMenuElement.winControl;
                    this._volumeElement.winControl.flyout = this._volumeFlyoutElement.winControl;
                }
            }
        },

        // Private Methods
        _setElement: function (element) {
            this._element = element;
            this._element.winControl = this;
            WinJS.Utilities.addClass(this._element, "pf-control-panel pf-interactive");

            this._replayElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-replay-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: replayIcon; winControl.label: replayLabel; winControl.tooltip: replayTooltip; winControl.disabled: isReplayDisabled; winControl.onclick: replay PlayerFramework.Binding.setEventHandler;" }]);
            this._skipPreviousElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-previous-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipPreviousIcon; winControl.label: skipPreviousLabel; winControl.tooltip: skipPreviousTooltip; winControl.disabled: isSkipPreviousDisabled; winControl.onclick: skipPrevious PlayerFramework.Binding.setEventHandler;" }]);
            this._rewindElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-rewind-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: rewindIcon; winControl.label: rewindLabel; winControl.tooltip: rewindTooltip; winControl.disabled: isRewindDisabled; winControl.onclick: rewind PlayerFramework.Binding.setEventHandler;" }]);
            this._playPauseElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-play-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playPauseIcon; winControl.label: playPauseLabel; winControl.tooltip: playPauseTooltip; winControl.disabled: isPlayPauseDisabled; winControl.onclick: playPause PlayerFramework.Binding.setEventHandler;" }]);
            this._playResumeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-play-resume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: playResumeIcon; winControl.label: playResumeLabel; winControl.tooltip: playResumeTooltip; winControl.disabled: isPlayResumeDisabled; winControl.onclick: playResume PlayerFramework.Binding.setEventHandler;" }]);
            this._pauseElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-pause-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: pauseIcon; winControl.label: pauseLabel; winControl.tooltip: pauseTooltip; winControl.disabled: isPauseDisabled; winControl.onclick: pause PlayerFramework.Binding.setEventHandler;" }]);
            this._fastForwardElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-fast-forward-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fastForwardIcon; winControl.label: fastForwardLabel; winControl.tooltip: fastForwardTooltip; winControl.disabled: isFastForwardDisabled; winControl.onclick: fastForward PlayerFramework.Binding.setEventHandler;" }]);
            this._slowMotionElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-slow-motion-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: slowMotionIcon; winControl.label: slowMotionLabel; winControl.tooltip: slowMotionTooltip; winControl.disabled: isSlowMotionDisabled; winControl.onclick: slowMotion PlayerFramework.Binding.setEventHandler;" }]);
            this._skipNextElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-next-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipNextIcon; winControl.label: skipNextLabel; winControl.tooltip: skipNextTooltip; winControl.disabled: isSkipNextDisabled; winControl.onclick: skipNext PlayerFramework.Binding.setEventHandler;" }]);
            this._skipBackElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-back-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipBackIcon; winControl.label: skipBackLabel; winControl.tooltip: skipBackTooltip; winControl.disabled: isSkipBackDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
            this._skipAheadElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-skip-ahead-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: skipAheadIcon; winControl.label: skipAheadLabel; winControl.tooltip: skipAheadTooltip; winControl.disabled: isSkipAheadDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
            this._elapsedTimeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-elapsed-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: elapsedTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: elapsedTimeText; winControl.label: elapsedTimeLabel; winControl.tooltip: elapsedTimeTooltip; winControl.disabled: isElapsedTimeDisabled; winControl.onclick: skipBack PlayerFramework.Binding.setEventHandler;" }]);
            this._timelineElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-timeline-control", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: currentTime; winControl.min: startTime; winControl.max: endTime; winControl.progress: bufferedPercentage; winControl.label: timelineLabel; winControl.tooltip: timelineTooltip; winControl.disabled: isTimelineDisabled; winControl.markers: visualMarkers; winControl.onstart: onTimelineSliderStart PlayerFramework.Binding.setEventHandler; winControl.onupdate: onTimelineSliderUpdate PlayerFramework.Binding.setEventHandler; winControl.oncomplete: onTimelineSliderComplete PlayerFramework.Binding.setEventHandler; winControl.onskiptomarker: onTimelineSliderSkipToMarker PlayerFramework.Binding.setEventHandler;", "data-win-options": "{ altStep1: 100000000, altStep2: 300000000, altStep3: Infinity }" }]);
            this._remainingTimeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-remaining-time-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: remainingTime PlayerFramework.Binding.timeConverter; winControl.hoverContent: remainingTimeText; winControl.label: remainingTimeLabel; winControl.tooltip: remainingTimeTooltip; winControl.disabled: isRemainingTimeDisabled; winControl.onclick: skipAhead PlayerFramework.Binding.setEventHandler;" }]);
            this._goLiveElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-go-live-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: goLiveText; winControl.label: goLiveLabel; winControl.tooltip: goLiveTooltip; winControl.disabled: isGoLiveDisabled; winControl.onclick: goLive PlayerFramework.Binding.setEventHandler;" }]);
            this._captionsElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-captions-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: captionsIcon; winControl.label: captionsLabel; winControl.tooltip: captionsTooltip; winControl.disabled: isCaptionsDisabled;", "data-win-options": "{ type: 'flyout' }" }]);
            this._audioElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-audio-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: audioIcon; winControl.label: audioLabel; winControl.tooltip: audioTooltip; winControl.disabled: isAudioDisabled;", "data-win-options": "{ type: 'flyout' }" }]);
            this._volumeMuteContainerElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-volume-mute-container" }]);
            this._volumeMuteElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["button", { "type": "button", "class": "pf-volume-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeMuteIcon; winControl.label: volumeMuteLabel; winControl.tooltip: volumeMuteTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onclick: onVolumeMuteClick PlayerFramework.Binding.setEventHandler; onfocus: onVolumeMuteFocus PlayerFramework.Binding.setEventHandler;" }]);
            this._volumeMuteSliderElement = PlayerFramework.Utilities.createElement(this._volumeMuteContainerElement, ["div", { "class": "pf-volume-slider-control", "style": "display: none;", "data-win-control": "PlayerFramework.UI.Slider", "data-win-bind": "winControl.value: volume; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeMuteDisabled; winControl.onupdate: onVolumeMuteSliderUpdate PlayerFramework.Binding.setEventHandler; onfocusin: onVolumeMuteSliderFocusIn PlayerFramework.Binding.setEventHandler; onfocusout: onVolumeMuteSliderFocusOut PlayerFramework.Binding.setEventHandler; onmspointerover: onVolumeMuteSliderMSPointerOver PlayerFramework.Binding.setEventHandler; onmspointerout: onVolumeMuteSliderMSPointerOut PlayerFramework.Binding.setEventHandler; ontransitionend: onVolumeMuteSliderTransitionEnd PlayerFramework.Binding.setTransitionEndEventHandler;", "data-win-options": "{ altStep1: 5, vertical: true, hidden: true }" }]);
            this._volumeElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-volume-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: volumeIcon; winControl.label: volumeLabel; winControl.tooltip: volumeTooltip; winControl.disabled: isVolumeDisabled;", "data-win-options": "{ type: 'flyout' }" }]);
            this._muteElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-mute-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: muteIcon; winControl.label: muteLabel; winControl.tooltip: muteTooltip; winControl.disabled: isMuteDisabled; winControl.onclick: toggleMuted PlayerFramework.Binding.setEventHandler;" }]);
            this._fullScreenElement = PlayerFramework.Utilities.createElement(this._element, ["button", { "type": "button", "class": "pf-full-screen-control", "data-win-control": "PlayerFramework.UI.Button", "data-win-bind": "winControl.content: fullScreenIcon; winControl.label: fullScreenLabel; winControl.tooltip: fullScreenTooltip; winControl.disabled: isFullScreenDisabled; winControl.onclick: toggleFullScreen PlayerFramework.Binding.setEventHandler;" }]);
            this._signalStrengthElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-signal-strength-control", "data-win-control": "PlayerFramework.UI.Meter", "data-win-bind": "winControl.value: signalStrength; winControl.label: signalStrengthLabel; winControl.tooltip: signalStrengthTooltip; winControl.disabled: isSignalStrengthDisabled;" }]);
            this._mediaQualityElement = PlayerFramework.Utilities.createElement(this._element, ["div", { "class": "pf-media-quality-control", "data-win-control": "PlayerFramework.UI.Indicator", "data-win-bind": "winControl.value: mediaQuality; winControl.label: mediaQualityLabel; winControl.tooltip: mediaQualityTooltip; winControl.disabled: isMediaQualityDisabled;" }]);

            WinJS.UI.processAll(this._element);

            this._bindEvent("MSPointerDown", this._element, this._onElementMSPointerDown);
        },

        _setOptions: function (options) {
            PlayerFramework.Utilities.setOptions(this, options, {
                hidden: false,
                isPlayPauseHidden: false,
                isPlayResumeHidden: false,
                isPauseHidden: false,
                isReplayHidden: false,
                isRewindHidden: false,
                isFastForwardHidden: false,
                isSlowMotionHidden: false,
                isSkipPreviousHidden: false,
                isSkipNextHidden: false,
                isSkipBackHidden: false,
                isSkipAheadHidden: false,
                isElapsedTimeHidden: false,
                isRemainingTimeHidden: false,
                isTimelineHidden: false,
                isGoLiveHidden: false,
                isCaptionsHidden: false,
                isAudioHidden: false,
                isVolumeMuteHidden: false,
                isVolumeHidden: false,
                isMuteHidden: false,
                isFullScreenHidden: false,
                isSignalStrengthHidden: false,
                isMediaQualityHidden: false
            });
        },

        _onElementMSPointerDown: function (e) {
            PlayerFramework.Utilities.addHideFocusClass(e.target);
        }
    });

    // ControlPanel Mixins
    WinJS.Class.mix(ControlPanel, WinJS.UI.DOMEventMixin);
    WinJS.Class.mix(ControlPanel, PlayerFramework.Utilities.eventBindingMixin);

    // ControlPanel Exports
    WinJS.Namespace.define("PlayerFramework.UI", {
        ControlPanel: ControlPanel
    });

})(PlayerFramework);

