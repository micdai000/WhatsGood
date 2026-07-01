import "server-only";

import type {
  CreateReviewInput,
  PaginatedResult,
  PaginationParams,
  Review,
  ServiceResult,
} from "@/types";
import { notImplemented } from "../shared";

export class ReviewService {
  async getReview(_id: string): Promise<ServiceResult<Review>> {
    return notImplemented("ReviewService.getReview");
  }

  async getReviews(
    _profileId: string,
    _params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<Review>>> {
    return notImplemented("ReviewService.getReviews");
  }

  async createReview(
    _input: CreateReviewInput,
  ): Promise<ServiceResult<Review>> {
    return notImplemented("ReviewService.createReview");
  }

  async getAverageRating(
    _profileId: string,
  ): Promise<ServiceResult<{ average: number; total: number }>> {
    return notImplemented("ReviewService.getAverageRating");
  }

  async deleteReview(_id: string): Promise<ServiceResult<void>> {
    return notImplemented("ReviewService.deleteReview");
  }
}

export const reviewService = new ReviewService();
