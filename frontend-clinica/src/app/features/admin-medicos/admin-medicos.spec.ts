import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMedicos } from './admin-medicos';

describe('AdminMedicos', () => {
  let component: AdminMedicos;
  let fixture: ComponentFixture<AdminMedicos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminMedicos],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminMedicos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
