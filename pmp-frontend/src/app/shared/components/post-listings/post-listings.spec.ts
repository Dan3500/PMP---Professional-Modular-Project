import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostListings } from './post-listings';

describe('PostListings', () => {
  let component: PostListings;
  let fixture: ComponentFixture<PostListings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostListings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostListings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
