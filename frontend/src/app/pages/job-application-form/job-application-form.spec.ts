import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationFormComponent } from './job-application-form';

describe('JobApplicationFormComponent', () => {
  let component: JobApplicationFormComponent;
  let fixture: ComponentFixture<JobApplicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApplicationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApplicationFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
