import { AuthenticatedRequest } from "@/types/auth";
import { Response } from "express";
import { errorResponse, successResponse } from "@/helpers/respose.helper";
import { ValidationError } from "sequelize";
import { UniqueConstraintError } from "sequelize";
import { DatabaseError } from "sequelize";
import { ConnectionError } from "sequelize";
import { AxiosError } from "axios";
import { NotificationService } from "@/services/notification.service";
import NotificationClient from "@/models/NotificationClient";
import PendingNotification from "@/models/PendingNotification";

export const sendNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { nip, message, title, url } = req.body;
    if (!nip || !message) {
      return errorResponse(res, "parameter not found", null, 400);
    }
    const client = await NotificationClient.findAll({
      where: {
        nip: nip,
      },
    });
    if (client.length === 0) {
      PendingNotification.create({
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
      });
    }
    client.forEach(async (client) => {
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
    });
    return successResponse(res, "Berhasil mengirim notifikasi", null, 200);
  } catch (error: unknown) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      const parsedErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return errorResponse(res, "Validation gagal", parsedErrors, 422);
    } else if (
      error instanceof DatabaseError ||
      error instanceof ConnectionError
    ) {
      const parsedErrors = error.message;
      return errorResponse(res, "Kesalahan pada database", parsedErrors, 500);
    } else if (error instanceof ConnectionError) {
      const parsedErrors = { message: "Gagal terhubung ke database" };
      return errorResponse(res, "Koneksi ke database gagal", parsedErrors, 503);
    } else if (error instanceof AxiosError) {
      if (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as AxiosError).isAxiosError
      ) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 500;
        const message =
          (axiosError.response?.data as { message?: string })?.message ||
          axiosError.message ||
          "Kesalahan pada permintaan eksternal";
        const details = axiosError.response?.data || null;
        return errorResponse(res, message, details, statusCode);
      }
      return errorResponse(res, "Terjadi kesalahan", null, 500);
    } else if (error instanceof Error) {
      const parsedErrors = { message: error.message };
      return errorResponse(res, "Terjadi kesalahan", parsedErrors, 500);
    } else {
      const parsedErrors = { message: "Kesalahan tidak diketahui" };
      return errorResponse(res, "Terjadi kesalahan", parsedErrors, 500);
    }
  }
};

export const broadcastNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { nip, message, title } = req.body;
    if (!nip || !message) {
      return errorResponse(res, "parameter not found", null, 400);
    }
    const client = await NotificationClient.findAll();
    client.forEach(async (client) => {
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
          body: message,
        },
        maxAttempts: 3,
      });
    });
    return successResponse(res, "Berhasil mengirim notifikasi", null, 200);
  } catch (error: unknown) {
    if (
      error instanceof ValidationError ||
      error instanceof UniqueConstraintError
    ) {
      const parsedErrors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return errorResponse(res, "Validation gagal", parsedErrors, 422);
    } else if (
      error instanceof DatabaseError ||
      error instanceof ConnectionError
    ) {
      const parsedErrors = error.message;
      return errorResponse(res, "Kesalahan pada database", parsedErrors, 500);
    } else if (error instanceof ConnectionError) {
      const parsedErrors = { message: "Gagal terhubung ke database" };
      return errorResponse(res, "Koneksi ke database gagal", parsedErrors, 503);
    } else if (error instanceof AxiosError) {
      if (
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error &&
        (error as AxiosError).isAxiosError
      ) {
        const axiosError = error as AxiosError;
        const statusCode = axiosError.response?.status || 500;
        const message =
          (axiosError.response?.data as { message?: string })?.message ||
          axiosError.message ||
          "Kesalahan pada permintaan eksternal";
        const details = axiosError.response?.data || null;
        return errorResponse(res, message, details, statusCode);
      }
      return errorResponse(res, "Terjadi kesalahan", null, 500);
    } else if (error instanceof Error) {
      const parsedErrors = { message: error.message };
      return errorResponse(res, "Terjadi kesalahan", parsedErrors, 500);
    } else {
      const parsedErrors = { message: "Kesalahan tidak diketahui" };
      return errorResponse(res, "Terjadi kesalahan", parsedErrors, 500);
    }
  }
};
