import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormMedico } from './form-medico';

describe('FormMedico', () => {
  let component: FormMedico;
  let fixture: ComponentFixture<FormMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
