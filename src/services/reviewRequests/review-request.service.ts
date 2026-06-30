import "server-only";

import type {
  CreateReviewRequestInput,
  PaginatedResult,
  PaginationParams,
  ReviewRequest,
  ServiceResult,
} from "@/types";
import { notImplemented } from "../shared";

export class ReviewRequestService {
  async getRequest(_id: string): Promise<ServiceResult<ReviewRequest>> {
    return notImplemented("ReviewRequestService.getRequest");
  }

  async getRequestsByProfile(
    _profileId: string,
    _params?: PaginationParams,
  ): Promise<ServiceResult<PaginatedResult<ReviewRequest>>> {
    return notImplemented("ReviewRequestService.getRequestsByProfile");
  }

  async createRequest(
    _input: CreateReviewRequestInput,
  ): Promise<ServiceResult<ReviewRequest>> {
    return notImplemented("ReviewRequestService.createRequest");
  }

  async resendRequest(_id: string): Promise<ServiceResult<ReviewRequest>> {
    return notImplemented("ReviewRequestService.resendRequest");
  }

  async completeRequest(_token: string): Promise<ServiceResult<ReviewRequest>> {
    return notImplemented("ReviewRequestService.completeRequest");
  }

  async expireRequest(_id: string): Promise<ServiceResult<ReviewRequest>> {
    return notImplemented("ReviewRequestService.expireRequest");
  }
}

export const reviewRequestService = new ReviewRequestService();
