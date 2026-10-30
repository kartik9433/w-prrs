import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center gap-1.5" [class.cursor-pointer]="interactive">
      <div class="flex items-center gap-0.5" (mouseleave)="onMouseLeave()">
        <button
          *ngFor="let star of [1, 2, 3, 4, 5]; let i = index"
          type="button"
          [disabled]="!interactive"
          (mouseenter)="onMouseEnter(star)"
          (click)="onSelect(star)"
          class="focus:outline-none transition-transform hover:scale-110 disabled:cursor-default"
          [title]="interactive ? 'Rate ' + star + ' stars' : rating + ' stars'"
        >
          <svg
            class="transition-colors"
            [ngClass]="{
              'w-4 h-4': size === 'sm',
              'w-5 h-5': size === 'md',
              'w-7 h-7': size === 'lg',
              'text-amber-400 fill-amber-400': isStarFilled(star),
              'text-slate-300 fill-slate-200': !isStarFilled(star)
            }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
        </button>
      </div>

      <span *ngIf="showLabel" class="text-sm font-semibold text-slate-700 ml-1">
        {{ (displayRating || 0) | number:'1.1-1' }}
      </span>
    </div>
  `
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() interactive: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() showLabel: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  hoverRating: number | null = null;

  get displayRating(): number {
    return this.hoverRating !== null ? this.hoverRating : this.rating;
  }

  isStarFilled(starIndex: number): boolean {
    const current = this.hoverRating !== null ? this.hoverRating : this.rating;
    return starIndex <= Math.round(current);
  }

  onMouseEnter(star: number): void {
    if (this.interactive) {
      this.hoverRating = star;
    }
  }

  onMouseLeave(): void {
    if (this.interactive) {
      this.hoverRating = null;
    }
  }

  onSelect(star: number): void {
    if (this.interactive) {
      this.rating = star;
      this.ratingChange.emit(star);
    }
  }
}
