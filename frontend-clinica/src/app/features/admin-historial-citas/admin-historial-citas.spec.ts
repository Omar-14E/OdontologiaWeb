import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHistorialCitas } from './admin-historial-citas';

describe('AdminHistorialCitas', () => {
  let component: AdminHistorialCitas;
  let fixture: ComponentFixture<AdminHistorialCitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHistorialCitas],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminHistorialCitas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
