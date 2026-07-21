import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnciclopediaPage } from './enciclopedia-page';

describe('EnciclopediaPage', () => {
  let component: EnciclopediaPage;
  let fixture: ComponentFixture<EnciclopediaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnciclopediaPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EnciclopediaPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
