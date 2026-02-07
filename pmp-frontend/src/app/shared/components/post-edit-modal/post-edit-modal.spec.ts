import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEditModal } from './post-edit-modal';

describe('PostEditModal', () => {
  let component: PostEditModal;
  let fixture: ComponentFixture<PostEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostEditModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
