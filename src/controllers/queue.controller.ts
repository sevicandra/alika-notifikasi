import { NotificationQueue } from "@/bullmq/queues/notification";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { InvalidRequestError, NotFoundError } from "@/utils/errors";
import { successResponse } from "@/helpers/respose.helper";
import { Request, Response } from "express";
import { JobType } from "bullmq";

import { BaseQueueProducer } from "@/bullmq/base-queue-producer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const queues: Record<string, BaseQueueProducer<any>> = {
  notification: NotificationQueue,
};

export const QueueController = {
  getQueueStatus: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;

    if (queueName) {
      if (typeof queueName !== "string") {
        throw new InvalidRequestError("Queue name must be a string");
      }
      const queue = queues[queueName.toLowerCase()];
      if (!queue) {
        throw new NotFoundError(`Queue ${queueName}`);
      }
      const counts = await queue.getJobCounts();
      const paused = await queue.isPaused();
      successResponse(res, `Status queue ${queueName} berhasil diambil`, { counts, paused });
      return;
    }

    const summary: Record<string, unknown> = {};
    for (const [name, queue] of Object.entries(queues)) {
      const counts = await queue.getJobCounts();
      const paused = await queue.isPaused();
      summary[name] = { counts, paused };
    }
    successResponse(res, "Status semua queue berhasil diambil", summary);
  }),

  getJobs: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    const statusParam = req.query.status as string | string[] | undefined;
    let types: JobType | JobType[] = ["waiting", "active", "delayed", "failed"];
    if (statusParam) {
      if (Array.isArray(statusParam)) {
        types = statusParam as JobType[];
      } else {
        types = statusParam.split(",") as JobType[];
      }
    }

    const start = req.query.start ? parseInt(req.query.start as string, 10) : 0;
    const end = req.query.end ? parseInt(req.query.end as string, 10) : 99;
    const asc = req.query.asc === "true";

    const jobs = await queue.getJobs(types, start, end, asc);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedJobs = jobs.map((job: any) => ({
      id: job.id,
      name: job.name,
      data: job.data,
      opts: job.opts,
      progress: job.progress,
      delay: job.delay,
      timestamp: job.timestamp,
      attemptsMade: job.attemptsMade,
      failedReason: job.failedReason,
      stacktrace: job.stacktrace,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    }));

    successResponse(res, `Daftar job untuk queue ${queueName} berhasil diambil`, mappedJobs);
  }),

  pauseQueue: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    await queue.pause();
    successResponse(res, `Queue ${queueName} berhasil di-pause`);
  }),

  resumeQueue: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    await queue.resume();
    successResponse(res, `Queue ${queueName} berhasil dilanjutkan (resume)`);
  }),

  cleanQueue: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    const grace = req.body.grace !== undefined ? Number(req.body.grace) : 0;
    const limit = req.body.limit !== undefined ? Number(req.body.limit) : 1000;
    const status = req.body.status || "completed";

    const validStatuses = ["completed", "wait", "active", "delayed", "failed"];
    if (!validStatuses.includes(status)) {
      throw new InvalidRequestError(
        `Status pembersihan tidak valid: ${status}. Harus salah satu dari: ${validStatuses.join(", ")}`
      );
    }

    const cleaned = await queue.clean(grace, limit, status);
    successResponse(res, `Berhasil membersihkan ${cleaned.length} job dari queue ${queueName}`, {
      cleanedCount: cleaned.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jobIds: cleaned.map((job: any) => job.id || job),
    });
  }),

  retryFailedJobs: asyncHandler(async (req: Request, res: Response) => {
    const { queueName } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    await queue.retryAllFailedJobs();
    successResponse(res, `Berhasil mengulang (retry) semua job gagal di queue ${queueName}`);
  }),

  deleteJob: asyncHandler(async (req: Request, res: Response) => {
    const { queueName, jobId } = req.params;
    if (typeof queueName !== "string") {
      throw new InvalidRequestError("Queue name must be a string");
    }
    if (typeof jobId !== "string") {
      throw new InvalidRequestError("Job ID wajib diisi");
    }

    const queue = queues[queueName.toLowerCase()];
    if (!queue) {
      throw new NotFoundError(`Queue ${queueName}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new NotFoundError(`Job ${jobId}`);
    }

    await queue.removeJob(jobId);
    successResponse(res, `Job ${jobId} berhasil dihapus dari queue ${queueName}`);
  }),
};
