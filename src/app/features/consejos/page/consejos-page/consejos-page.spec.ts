import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsejosPage } from './consejos-page';

describe('ConsejosPage', () => {
  let component: ConsejosPage;
  let fixture: ComponentFixture<ConsejosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsejosPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsejosPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
