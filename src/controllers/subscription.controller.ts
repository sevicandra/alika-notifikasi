import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { NotificationService } from "@/services/notification.service";
import {
  AuthorizationError,
  InternalServerError,
  InvalidRequestError,
  NotFoundError,
} from "@/utils/errors";
import { successResponse } from "@/helpers/respose.helper";
import { sortBuilder } from "@/helpers/sequelizer.helper";
import { NotificationClient, PendingNotification } from "@/repositories";

export const SubscriptionController = {
  getAllClient: asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || undefined;
    const offset = parseInt(req.query.offset as string) || undefined;
    const sort = req.query.sort as string;
    const order = sortBuilder(sort);

    const { items: data, pagination } = await NotificationClient.findAllWithPagination({
      limit,
      offset,
      order,
    });

    successResponse(res, "Success get all notification clients", data, pagination);
  }),

  getClientById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new InvalidRequestError("Invalid request");
    }

    const data = await NotificationClient.findById(id);
    if (!data) {
      throw new NotFoundError("Data not found");
    }

    successResponse(res, "Success get notification client", data);
  }),

  getClientByEndpoint: asyncHandler(async (req: Request, res: Response) => {
    const endpoint = req.query.endpoint as string;
    if (typeof endpoint !== "string") {
      throw new InvalidRequestError("Invalid request");
    }
    const data = await NotificationClient.findOne({ where: { endpoint } });
    if (!data) {
      throw new NotFoundError("Data not found");
    }
    successResponse(res, "Success get notification client", data);
  }),

  create: asyncHandler(
    async (req: Request, res: Response) => {
      const t = req.transaction;
      if (!t) {
        throw new InternalServerError("Transaction not found");
      }

      const nip = req.user?.nip;
      const name = req.user?.name;
      if (!nip || !name) {
        throw new AuthorizationError("Pengguna tidak dapat di verifikasi");
      }
      const { endpoint, p256dh, auth } = req.body;
      if (!endpoint || !p256dh || !auth) {
        throw new InvalidRequestError("Invalid request");
      }
      const data = await NotificationClient.create(
        {
          nip,
          endpoint,
          p256dh,
          auth,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        {
          transaction: t,
        }
      );

      await NotificationService.addNotification({
        client: {
          endpoint: data.endpoint,
          nip: data.nip,
          keys: {
            p256dh: data.p256dh,
            auth: data.auth,
          },
        },
        payload: {
          title: "Selamat datang di Alika",
          body: `Hi ${name}, selamat datang di Alika. Anda telah berhasil terdaftar untuk menerima notifikasi.`,
        },
        maxAttempts: 3,
      });

      const pending = await PendingNotification.findAll({
        where: {
          nip: nip,
        },
      });
      if (pending.length > 0) {
        await PendingNotification.delete(
          {
            where: {
              nip: nip,
            },
          },
          t
        );

        await Promise.all(
          pending.map(async (pending) => {
            await NotificationService.addNotification({
              client: {
                endpoint: endpoint,
                nip: nip,
                keys: {
                  p256dh: p256dh,
                  auth: auth,
                },
              },
              payload: {
                title: pending.title || "Alika DJKN",
                body: `[${new Date().toLocaleDateString("id", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                })}] ${pending.message}`,
              },
              maxAttempts: 3,
            });
          })
        );
      }

      successResponse(res, "Success create notification client", data);
    },
    {
      useTransaction: true,
    }
  ),

  update: asyncHandler(
    async (req: Request, res: Response) => {
      const t = req.transaction;
      if (!t) {
        throw new InternalServerError("Transaction not found");
      }

      const nip = req.user?.nip;
      if (!nip) {
        throw new AuthorizationError("Pengguna tidak dapat di verifikasi");
      }
      const { id } = req.params;
      if (typeof id !== "string") {
        throw new InvalidRequestError("Invalid request");
      }
      const { p256dh, auth } = req.body;
      if (!p256dh || !auth) {
        throw new InvalidRequestError("Invalid request");
      }
      const data = await NotificationClient.updateById(
        id,
        {
          nip: req.user?.nip,
          p256dh,
          auth,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        t
      );

      const pending = await PendingNotification.findAll({
        where: {
          nip: nip,
        },
      });
      if (pending.length > 0) {
        await PendingNotification.delete(
          {
            where: {
              nip: nip,
            },
          },
          t
        );

        await Promise.all(
          pending.map(async (pending) => {
            await NotificationService.addNotification({
              client: {
                endpoint: data.endpoint,
                nip: nip,
                keys: {
                  p256dh: p256dh,
                  auth: auth,
                },
              },
              payload: {
                title: pending.title || "Alika DJKN",
                body: `[${new Date().toLocaleDateString("id", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                })}] ${pending.message}`,
              },
              maxAttempts: 3,
            });
          })
        );
      }
      successResponse(res, "Success update notification client", data);
    },
    {
      useTransaction: true,
    }
  ),

  updateByEndpoint: asyncHandler(
    async (req: Request, res: Response) => {
      const t = req.transaction;
      if (!t) {
        throw new InternalServerError("Transaction not found");
      }

      const nip = req.user?.nip;
      if (!nip) {
        throw new AuthorizationError("Pengguna tidak dapat di verifikasi");
      }

      const { endpoint } = req.body;
      if (typeof endpoint !== "string") {
        throw new InvalidRequestError("Invalid request");
      }
      const { p256dh, auth } = req.body;
      const data = await NotificationClient.updateOne(
        {
          where: {
            endpoint: endpoint,
          },
        },
        {
          nip: nip,
          p256dh: p256dh,
          auth: auth,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        t
      );

      const pending = await PendingNotification.findAll({
        where: {
          nip: nip,
        },
      });
      if (pending.length > 0) {
        await PendingNotification.delete(
          {
            where: {
              nip: nip,
            },
          },
          t
        );

        await Promise.all(
          pending.map(async (pending) => {
            await NotificationService.addNotification({
              client: {
                endpoint: data.endpoint,
                nip: nip,
                keys: {
                  p256dh: p256dh,
                  auth: auth,
                },
              },
              payload: {
                title: pending.title || "Alika DJKN",
                body: `[${new Date().toLocaleDateString("id", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Jakarta",
                })}] ${pending.message}`,
              },
              maxAttempts: 3,
            });
          })
        );
      }

      successResponse(res, "Success update notification client", data);
    },
    {
      useTransaction: true,
    }
  ),

  delete: asyncHandler(
    async (req: Request, res: Response) => {
      const t = req.transaction;
      if (!t) {
        throw new InternalServerError("Transaction not found");
      }

      const { id } = req.params;
      if (typeof id !== "string") {
        throw new InvalidRequestError("Invalid request");
      }
      const data = await NotificationClient.deleteById(id, t);
      successResponse(res, "Success delete notification client", data);
    },
    {
      useTransaction: true,
    }
  ),

  deleteByEndpoint: asyncHandler(
    async (req: Request, res: Response) => {
      const t = req.transaction;
      if (!t) {
        throw new InternalServerError("Transaction not found");
      }

      const endpoint = req.query.endpoint as string;
      if (typeof endpoint !== "string") {
        throw new InvalidRequestError("Invalid request");
      }
      const data = await NotificationClient.deleteOne({ where: { endpoint } }, t);
      successResponse(res, "Success delete notification client", data);
    },
    {
      useTransaction: true,
    }
  ),
};
