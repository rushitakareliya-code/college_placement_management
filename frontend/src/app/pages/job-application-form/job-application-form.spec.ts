import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApplicationForm } from './job-application-form';

describe('JobApplicationForm', () => {
  let component: JobApplicationForm;
  let fixture: ComponentFixture<JobApplicationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobApplicationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApplicationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
