import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruiterGuidelines } from './recruiter-guidelines';

describe('RecruiterGuidelines', () => {
  let component: RecruiterGuidelines;
  let fixture: ComponentFixture<RecruiterGuidelines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecruiterGuidelines],
    }).compileComponents();

    fixture = TestBed.createComponent(RecruiterGuidelines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
