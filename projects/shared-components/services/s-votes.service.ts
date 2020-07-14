import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiRoutesService } from 'projects/shared-services/api-routes.service';
import { IQuestionTypes } from 'projects/shared-models/question_types.model';
import { API_ROUTES } from 'projects/shared-services/api-routes.constants';
import { IPoll } from 'projects/shared-models/poll.model';
import { Observable } from 'rxjs';
import { IUsers } from 'projects/shared-models/users.model';

@Injectable({
  providedIn: 'root'
})
export class SVotesService {

  constructor(
    private http: HttpClient,
    private apiRoutesService: ApiRoutesService
  ) { }


  pGetVotesCount(votableType, votableId): Observable<any> {
    const params = new HttpParams().set('votable_type', votableType).set('votable_id', votableId);
    return this.http.get<any>(
      this.apiRoutesService.getRoute(API_ROUTES.VOTES.PUBLIC.COUNT), {params});
  }

  pGetVoters(votableType, votableId, page, count): Observable<IUsers> {
    const params = new HttpParams().set('votable_type', votableType).set('votable_id', votableId).set('page', page).set('count', count);
    return this.http.get<IUsers>(
      this.apiRoutesService.getRoute(API_ROUTES.VOTES.PUBLIC.VOTERS), {params});
  }

}
