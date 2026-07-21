import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoridadesPage } from './autoridades-page';

describe('AutoridadesPage', () => {
  let component: AutoridadesPage;
  let fixture: ComponentFixture<AutoridadesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoridadesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AutoridadesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
