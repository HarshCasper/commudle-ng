import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { ILab, EPublishStatus } from 'projects/shared-models/lab.model';
import { LabsService } from '../../services/labs.service';
import { Title } from '@angular/platform-browser';
import { LibToastLogService } from 'projects/shared-services/lib-toastlog.service';
import { LibAuthwatchService } from 'projects/shared-services/lib-authwatch.service';
import { NbWindowService } from '@nebular/theme';
import { EPublishStatusColors } from 'projects/shared-models/community-build.model';
import { faFlask } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-my-labs',
  templateUrl: './my-labs.component.html',
  styleUrls: ['./my-labs.component.scss']
})
export class MyLabsComponent implements OnInit, OnDestroy {
  faFlask = faFlask;
  moment = moment;
  userSubscription;


  labs: ILab[] = [];
  EPublishStatus = EPublishStatus;
  EPublishStatusColors = EPublishStatusColors;
  publishStatuses = Object.keys(EPublishStatus);
  incompleteProfile = false;
  windowRef;

  constructor(
    private labsService: LabsService,
    private title: Title,
    private toastLogService: LibToastLogService,
    private authWatchService: LibAuthwatchService,
    private windowService: NbWindowService
  ) {
    title.setTitle('My Labs');
  }

  ngOnInit() {
    this.getAllBuilds();
    this.userSubscription = this.authWatchService.currentUser$.subscribe(
      data => {
        if (data && !data.profile_completed) {
          this.incompleteProfile = true;
        }
      }
    );
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubscription.unsubscribe();
  }


  getAllBuilds() {
    this.labsService.getAll().subscribe(
      data => {
        this.labs = data.labs;
      }
    );
  }



  destroyLab(labId) {
    const labIndex = this.labs.findIndex(k => k.id === labId);
    this.labsService.destroy(this.labs[labIndex].id).subscribe(
      data => {
        if (data) {
          this.labs.splice(labIndex, 1);
          this.toastLogService.successDialog('Deleted');
        }
      }
    );
  }



}
