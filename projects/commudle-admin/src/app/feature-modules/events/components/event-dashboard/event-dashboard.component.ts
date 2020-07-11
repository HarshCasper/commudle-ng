import { Component, OnInit } from '@angular/core';
import { IEvent } from 'projects/shared-models/event.model';
import { ActivatedRoute } from '@angular/router';
import { ICommunity } from 'projects/shared-models/community.model';
import { faClock, faEdit, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { Title } from '@angular/platform-browser';
import { IEventStatus } from 'projects/shared-models/event_status.model';
import { EEventStatuses } from 'projects/shared-models/enums/event_statuses.enum';
import { EventsService } from 'projects/commudle-admin/src/app/services/events.service';
import { FormBuilder, Validators } from '@angular/forms';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';

@Component({
  selector: 'app-event-dashboard',
  templateUrl: './event-dashboard.component.html',
  styleUrls: ['./event-dashboard.component.scss']
})
export class EventDashboardComponent implements OnInit {
  moment = moment;
  EEventStatuses = EEventStatuses;

  faClock = faClock;
  faEdit = faEdit;
  faInfoCircle = faInfoCircle;

  event: IEvent;
  community: ICommunity;

  uploadedHeaderImageFile: File;
  uploadedHeaderImage;


  eventHeaderImageForm = this.fb.group({
    header_image: ['', Validators.required],
  });


  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private eventsService: EventsService,
    private toastLogService: LibToastLogService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {

    this.activatedRoute.data.subscribe(data => {
      this.event = data.event;

      this.community = data.community;
      this.titleService.setTitle(`${this.event.name} Dashboard | ${this.community.name}`);
    });
  }


  updateEventStatus($event: IEventStatus) {
    this.event.event_status = $event;
  }

  updateRegistrationType(value) {
    this.eventsService.updateCustomRegistration(this.event.id, value).subscribe(
      data => {
        this.event = data;
      }
    );
  }

  updateAgendaType(value) {
    this.eventsService.updateCustomAgenda(this.event.id, value).subscribe(
      data => {
        this.event = data;
      }
    );
  }




  displaySelectedHeaderImage(event: any) {

    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2425190) {
        this.toastLogService.warningDialog('Image should be less than 2 Mb', 3000);
        return;
      }
      this.uploadedHeaderImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedHeaderImage = reader.result;
      };

      reader.readAsDataURL(file);
      this.updateEventHeader();
    }

  }

  updateEventHeader() {
    const formData: any = new FormData();
    formData.append('header_image', this.uploadedHeaderImageFile);
    this.eventsService.updateHeaderImage(this.event.id, formData).subscribe(
      data => {
        this.event = data;
        this.toastLogService.successDialog('Updated!');
      }
    );
  }

  deleteEventHeader() {
    this.eventsService.deleteHeaderImage(this.event.id).subscribe(
      data => {
        this.event = data;
        this.toastLogService.successDialog('Deleted');
      }
    );
  }

}
