import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPacientes } from './admin-pacientes';

describe('AdminPacientes', () => {
  let component: AdminPacientes;
  let fixture: ComponentFixture<AdminPacientes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPacientes],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPacientes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
