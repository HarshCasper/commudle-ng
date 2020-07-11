import { Component, OnInit, Input, OnChanges, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { EEmbeddedVideoStreamSources } from 'projects/shared-models/enums/embedded_video_stream_sources.enum';
import { DomSanitizer } from '@angular/platform-browser';
declare var JitsiMeetExternalAPI: any;
@Component({
  selector: 'app-video-stream',
  templateUrl: './video-stream.component.html',
  styleUrls: ['./video-stream.component.scss']
})
export class VideoStreamComponent implements OnInit, OnChanges {
  @ViewChild('jitsimeet', {static: false}) private jitsiMeet: ElementRef;
  api;

  EEmbeddedVideoStreamSources = EEmbeddedVideoStreamSources;

  @Input() videoSource: string;
  @Input() videoCode: any;
  @Input() fillerText: string;
  @Input() width: number;
  @Input() height: number;

  playerUrl: any;

  constructor(
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.setPreview();
    if (!this.fillerText) {
      this.fillerText = 'Loading...';
    }
  }

  ngOnChanges(): void {
    this.setPreview();
  }

  setPreview() {
    if (this.videoCode) {
      switch (this.videoSource) {
        case EEmbeddedVideoStreamSources.YOUTUBE:
          this.youtubeParser();
          break;
        case EEmbeddedVideoStreamSources.JITSI_MEET:
          this.playerUrl = this.videoCode;
          this.initJitsi();
          break;
        case EEmbeddedVideoStreamSources.EXTERNAL_LINK:
          this.playerUrl = this.videoCode;
          break;
        default: // for other embeds
          this.playerUrl = this.sanitizer.bypassSecurityTrustHtml(this.videoCode);
          break;
      }
    } else {
      this.playerUrl = undefined;
    }

  }

  youtubeParser() {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const val = this.videoCode.match(regExp);
    this.playerUrl = (val && val[7].length === 11) ? val[7] : '';
  }

  initJitsi() {

    this.changeDetectorRef.detectChanges();
    const domJitsi = this.jitsiMeet.nativeElement as HTMLElement;
    const domain = 'meet.jit.si';
    const options = {
        roomName: this.playerUrl,
        width: this.width || 640,
        height: this.height || 480,
        parentNode: domJitsi,
        configOverwrite: { startWithAudioMuted: true },
    };

    if (this.api) {
      this.api.dispose();
    }
    this.api = new JitsiMeetExternalAPI(domain, options);
  }

}
