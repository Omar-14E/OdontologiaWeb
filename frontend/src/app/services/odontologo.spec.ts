import { TestBed } from '@angular/core/testing';

import { Odontologo } from './odontologo';

describe('Odontologo', () => {
  let service: Odontologo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Odontologo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
