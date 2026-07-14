import { NotificationService } from "@/services/notification.service";
import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler.middleware";
import { InvalidRequestError, InternalServerError } from "@/utils/errors";
import { successResponse } from "@/helpers/respose.helper";
import { NotificationClient, PendingNotification } from "@/repositories";

export const NotificationController = {
  sendNotification: asyncHandler(async (req: Request, res: Response) => {
    const t = req.transaction;
    if (!t) {
      throw new InternalServerError("Transaction not found");
    }

    const { nip, message, title, url } = req.body;
    if (!nip || !message) {
      throw new InvalidRequestError("Invalid request");
    }
    const client = await NotificationClient.findAll({
      where: {
        nip: nip,
      }
    });
    if (client.length === 0) {
      await PendingNotification.create({
        nip: nip,
        message: `[${new Date().toLocaleDateString("id", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        })}] ${message}`,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        title: title,
      }, {
        transaction: t
      });
    }

    await Promise.all(
      client.map(async (client) => {
        const { endpoint, p256dh, auth } = client;

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
            title: title || "Alika DJKN",
            body: `[${new Date().toLocaleDateString("id", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            })}] ${message}`,
            actions: [
              {
                action: "open",
                title: "Buka",
              },
              {
                action: "dismiss",
                title: "Tutup",
              },
            ],
            url: url,
          },
          maxAttempts: 3,
        });
      })
    );

    successResponse(res, "Success send notification");
  }, { useTransaction: true }),

  sendBulkNotification: asyncHandler(async (req: Request, res: Response) => {
    const t = req.transaction;
    if (!t) {
      throw new InternalServerError("Transaction not found");
    }
    const { nip, message, title, url } = req.body;
    if (!Array.isArray(nip) || !message) {
      throw new InvalidRequestError("Invalid request");
    }


    for (const n of nip) {

      const client = await NotificationClient.findAll({
        where: {
          nip: n,
        }
      });
      if (client.length === 0) {
        await PendingNotification.create({
          nip: n,
          message: `[${new Date().toLocaleDateString("id", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Jakarta",
          })}] ${message}`,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
          title: title,
        }, {
          transaction: t
        });
      }

      await Promise.all(
        client.map(async (client) => {
          const { endpoint, p256dh, auth } = client;

          await NotificationService.addNotification({
            client: {
              endpoint: endpoint,
              nip: n,
              keys: {
                p256dh: p256dh,
                auth: auth,
              },
            },
            payload: {
              title: title || "Alika DJKN",
              body: `[${new Date().toLocaleDateString("id", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Jakarta",
              })}] ${message}`,
              actions: [
                {
                  action: "open",
                  title: "Buka",
                },
                {
                  action: "dismiss",
                  title: "Tutup",
                },
              ],
              url: url,
            },
            maxAttempts: 3,
          });
        })
      );
    }

    successResponse(res, "Success send bulk notification");

  }, { useTransaction: true }),

  broadcast: asyncHandler(async (req: Request, res: Response) => {
    const t = req.transaction;
    if (!t) {
      throw new InternalServerError("Transaction not found");
    }
    const { message, title, url } = req.body;
    if (!message) {
      throw new InvalidRequestError("Invalid request");
    }


    const client = await NotificationClient.findAll();
    await Promise.all(
      client.map(async (client) => {
        const { endpoint, p256dh, auth, nip } = client;

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
            title: title || "Alika DJKN",
            body: `[${new Date().toLocaleDateString("id", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "Asia/Jakarta",
            })}] ${message}`,
            actions: [
              {
                action: "open",
                title: "Buka",
              },
              {
                action: "dismiss",
                title: "Tutup",
              },
            ],
            url: url,
          },
          maxAttempts: 3,
        });
      })
    );

    successResponse(res, "Success broadcast notification");
  }, { useTransaction: true }),

}
