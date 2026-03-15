import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGuidelines } from './student-guidelines';

describe('StudentGuidelines', () => {
  let component: StudentGuidelines;
  let fixture: ComponentFixture<StudentGuidelines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentGuidelines],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentGuidelines);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
