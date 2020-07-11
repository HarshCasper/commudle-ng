import { Component, OnInit, HostListener } from '@angular/core';
import { IDataFormEntityResponseGroup } from 'projects/shared-models/data_form_entity_response_group.model';
import { ISpeakerResource } from 'projects/shared-models/speaker_resource.model';
import { ITrackSlot } from 'projects/shared-models/track-slot.model';
import { TrackSlotsService } from 'projects/commudle-admin/src/app/services/track_slots.service';
import { ActivatedRoute } from '@angular/router';
import { IUser } from 'projects/shared-models/user.model';
import * as moment from 'moment';
import { ICommunity } from 'projects/shared-models/community.model';
import { IEvent } from 'projects/shared-models/event.model';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { EEventStatuses } from 'projects/shared-models/enums/event_statuses.enum';
import { DiscussionsService } from 'projects/commudle-admin/src/app/services/discussions.service';
import { IDiscussion } from 'projects/shared-models/discussion.model';
import { EmbeddedVideoStreamsService } from 'projects/commudle-admin/src/app/services/embedded-video-streams.service';
import { IEmbeddedVideoStream } from 'projects/shared-models/embedded_video_stream.model';
import { UserVisitsService } from 'projects/shared-services/user-visits.service';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { ICurrentUser } from 'projects/shared-models/current_user.model';

@Component({
  selector: 'app-speaker-session-page',
  templateUrl: './speaker-session-page.component.html',
  styleUrls: ['./speaker-session-page.component.scss']
})
export class SpeakerSessionPageComponent implements OnInit {

  trackSlot: ITrackSlot;
  speaker: IUser;

  community: ICommunity;
  event: IEvent;

  dataFormEntityResponseGroup: IDataFormEntityResponseGroup;

  discussion: IDiscussion;

  pollableType;
  pollableId;

  speakerResource: ISpeakerResource;
  embeddedVideoStream: IEmbeddedVideoStream;


  EEventStatuses = EEventStatuses;
  moment = moment;
  playerWidth;
  playerHeight;

  userVisitData;

  startTime;
  endTime;

  currentUser: ICurrentUser;

  constructor(
    private activatedRoute: ActivatedRoute,
    private trackSlotsService: TrackSlotsService,
    private discussionsService: DiscussionsService,
    private embeddedVideoStreamsService: EmbeddedVideoStreamsService,
    private title: Title,
    private userVisitsService: UserVisitsService,
    private authWatchService: LibAuthwatchService
  ) {
    this.onResize();
  }

  ngOnInit() {
    this.resolveData();

    this.authWatchService.currentUser$.subscribe(
      data => {
        this.currentUser = data;
      }
    );

    this.userVisitsService.visitors$.subscribe(
      data => {
        this.userVisitData = data;
      }
    );
  }

  resolveData() {
    this.activatedRoute.data.subscribe(
      data => {
        this.community = data.community;
        this.event = data.event;
        this.startTime = this.event.start_time;
        this.endTime = this.event.end_time;
        if (this.event.custom_agenda) {
          this.activatedRoute.queryParams.subscribe(
            params => {
              this.getTrackSlot(params.track_slot_id);
              this.pollableId = params.track_slot_id;
              this.pollableType = 'TrackSlot';
            }
          );
        } else {
          this.getEventEmbeddedVideoStream();
          this.getDiscussionQnA();
          this.title.setTitle(`Live Session | ${this.event.name}`);
          this.pollableId = this.event.id;
          this.pollableType = 'Event';
        }
      }
    );
  }

  getTrackSlot(trackSlotId) {
    this.trackSlotsService.pGetTrackSlot(trackSlotId).subscribe(
      data => {
        this.trackSlot = data;
        this.getDiscussionQnA();
        this.speaker = data.user;
        this.startTime = this.trackSlot.start_time;
        this.endTime = this.trackSlot.end_time;
        if (this.trackSlot.embedded_video_stream) {
          this.embeddedVideoStream = this.trackSlot.embedded_video_stream;
        }

        if (this.speaker) {
          this.title.setTitle(`${this.speaker.name} | ${this.trackSlot.session_title}`);
        }
      }
    );
  }

  getDiscussionQnA() {
    if (this.trackSlot) {
      this.discussionsService.pGetOrCreateQnAForTrackSlot(this.trackSlot.id).subscribe(
        data => {
          this.discussion = data;
        }
      );
    } else {
      this.discussionsService.pGetOrCreateQnAForEvent(this.event.id).subscribe(
        data => {
          this.discussion = data;
        }
      );
    }

  }

  getEventEmbeddedVideoStream() {
    this.embeddedVideoStreamsService.pGet('Event', this.event.id).subscribe(
      data => {
        this.embeddedVideoStream = data;
      }
    );
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?) {
    if (window.innerWidth <= 800) {
      this.playerWidth = window.innerWidth - 20;
      this.playerHeight = (this.playerWidth as number) / 1.78;
    } else {
      this.playerWidth = 700;
      this.playerHeight = 410;
    }
  }

}
