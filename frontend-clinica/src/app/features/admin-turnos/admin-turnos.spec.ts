import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTurnos } from './admin-turnos';

describe('AdminTurnos', () => {
  let component: AdminTurnos;
  let fixture: ComponentFixture<AdminTurnos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTurnos],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTurnos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
