
import { Router, Response, Request } from "express";
import { pool } from "./db";

import {
  authenticateToken,
  requireAdmin,
  AuthRequest
} from "./authMiddleware";

const router = Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);


// ==========================================
// GET ALL REPORTS - ADMIN ONLY
// ==========================================

router.get("/reports", async (_req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.user_id,
         u.name AS citizen_name,
         u.email AS citizen_email,
         r.title,
         r.description,
         r.category,
         r.status,
         r.location,
         r.latitude,
         r.longitude,
         r.created_at,
         r.merged_into_report_id,
         r.merged_at,
         r.merged_by,
         r.resolution_summary,
         r.municipality_response,
         r.resolution_date,
         rm.file_path AS photo_path
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT file_path
         FROM report_media
         WHERE report_id = r.id
         ORDER BY created_at ASC
         LIMIT 1
       ) rm ON true
       ORDER BY r.created_at DESC`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows
    });

  } catch (error) {
    console.error("Admin reports fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin reports."
    });
  }
});


// ==========================================
// GET REPORT ACTIVITY HISTORY - ADMIN ONLY
// ==========================================

router.get(
  "/reports/:id/history",
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID."
      });
    }

    try {
      // Get report submission details
      const reportResult = await pool.query(
        `SELECT id, title, created_at
         FROM reports
         WHERE id = $1`,
        [reportId]
      );

      if (reportResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Report not found."
        });
      }

      // Get all status changes and admin details
      const historyResult = await pool.query(
        `SELECT
           h.id,
           h.old_status,
           h.new_status,
           h.reason,
           h.created_at,
           u.name AS changed_by_name
         FROM report_status_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.report_id = $1
         ORDER BY h.created_at ASC`,
        [reportId]
      );

      // Get all forwarding events and admin details
      const forwardingResult = await pool.query(
        `SELECT
           rf.id,
           rf.authority_name,
           rf.department,
           rf.reference_number,
           rf.forwarding_channel,
           rf.notes,
           rf.created_at,
           u.name AS forwarded_by_name
         FROM report_forwardings rf
         LEFT JOIN users u ON rf.forwarded_by = u.id
         WHERE rf.report_id = $1
         ORDER BY rf.created_at ASC`,
        [reportId]
      );

      return res.json({
        success: true,
        report: reportResult.rows[0],
        history: historyResult.rows,
        forwardings: forwardingResult.rows
      });

    } catch (error) {
      console.error("Report activity fetch error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch report activity."
      });
    }
  }
);


// ==========================================
// UPDATE REPORT STATUS - ADMIN ONLY
// ==========================================

router.patch(
  "/reports/:id/status",
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.id);

    const {
      status,
      reason,
      resolution_summary,
      municipality_response,
      resolution_date
    } = req.body;

    const adminId = (req as AuthRequest).userId;

    const allowedStatuses = [
      "Pending",
      "Under Review",
      "In Progress",
      "Resolved",
      "Rejected"
    ];

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID."
      });
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status."
      });
    }

    if (
      status === "Rejected" &&
      (typeof reason !== "string" || !reason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required."
      });
    }

    // Resolution details are required when marking Resolved
    if (
      status === "Resolved" &&
      (
        typeof resolution_summary !== "string" ||
        !resolution_summary.trim() ||
        typeof municipality_response !== "string" ||
        !municipality_response.trim() ||
        typeof resolution_date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(resolution_date) ||
        Number.isNaN(Date.parse(resolution_date)) ||
        new Date(resolution_date).toISOString().slice(0, 10) !== resolution_date
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Resolution summary, municipality response and valid resolution date are required."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const reportResult = await client.query(
        `SELECT
           id,
           user_id,
           title,
           status,
           merged_into_report_id
         FROM reports
         WHERE id = $1
         FOR UPDATE`,
        [reportId]
      );

      if (reportResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Report not found."
        });
      }

      const report = reportResult.rows[0];

      if (report.merged_into_report_id !== null) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "This report has been merged. Update the primary report instead."
        });
      }

      const oldStatus = report.status;

      if (oldStatus === status) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Report already has this status."
        });
      }

      // Update status and resolution details
      if (status === "Resolved") {
        await client.query(
          `UPDATE reports
           SET status = $1,
               resolution_summary = $2,
               municipality_response = $3,
               resolution_date = $4::date
           WHERE id = $5`,
          [
            status,
            resolution_summary.trim(),
            municipality_response.trim(),
            resolution_date,
            reportId
          ]
        );

      } else {
        await client.query(
          `UPDATE reports
           SET status = $1
           WHERE id = $2`,
          [status, reportId]
        );
      }

      // Record status change
      await client.query(
        `INSERT INTO report_status_history
         (
           report_id,
           old_status,
           new_status,
           changed_by,
           reason
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          reportId,
          oldStatus,
          status,
          adminId,
          typeof reason === "string" && reason.trim()
            ? reason.trim()
            : null
        ]
      );

      // Create notification for the citizen
      const citizenId = report.user_id;
      const reportTitle = report.title;

      let notificationTitle = `Report ${status.toLowerCase()}`;
      let notificationMessage =
        `Your report "${reportTitle}" has been updated to ${status}.`;
      let notificationType = "status";

      if (status === "Resolved") {
        notificationTitle = "Issue resolved";

        notificationMessage =
          `Your report "${reportTitle}" has been marked as resolved.\n\n` +
          `Resolution Summary: ${resolution_summary.trim()}\n\n` +
          `Municipality Response: ${municipality_response.trim()}`;

        notificationType = "success";

      } else if (status === "Rejected") {
        notificationTitle = "Report rejected";

        notificationMessage =
          `Your report "${reportTitle}" has been rejected.\n\n` +
          `Reason for rejection: ${reason.trim()}`;

        notificationType = "info";
      }

      await client.query(
        `INSERT INTO notifications
         (
           user_id,
           report_id,
           title,
           message,
           notification_type
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          citizenId,
          reportId,
          notificationTitle,
          notificationMessage,
          notificationType
        ]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Report status updated successfully.",
        reportId,
        oldStatus,
        newStatus: status
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Report status update error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update report status."
      });

    } finally {
      client.release();
    }
  }
);


// ==========================================
// FORWARD REPORT TO GOVERNMENT AUTHORITY
// ADMIN ONLY
// ==========================================

router.post(
  "/reports/:id/forward",
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.id);
    const adminId = (req as AuthRequest).userId;

    const {
      authority_name,
      department,
      reference_number,
      forwarding_channel,
      notes
    } = req.body;

    // Validate report ID
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID."
      });
    }

    // Validate required authority name
    if (
      typeof authority_name !== "string" ||
      !authority_name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Authority name is required."
      });
    }

    // Validate optional text fields
    const optionalFields = [
      department,
      reference_number,
      forwarding_channel,
      notes
    ];

    if (
      optionalFields.some(
        value =>
          value !== undefined &&
          value !== null &&
          typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid forwarding details."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Lock report during forwarding
      const reportResult = await client.query(
        `SELECT status
         FROM reports
         WHERE id = $1
         FOR UPDATE`,
        [reportId]
      );

      if (reportResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Report not found."
        });
      }

      const oldStatus = reportResult.rows[0].status;

      // Only reviewed or already forwarded reports can be forwarded
      if (
        oldStatus !== "Under Review" &&
        oldStatus !== "In Progress"
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Only reports Under Review or In Progress can be forwarded."
        });
      }

      // Save forwarding details
      const forwardingResult = await client.query(
        `INSERT INTO report_forwardings
         (
           report_id,
           authority_name,
           department,
           reference_number,
           forwarding_channel,
           notes,
           forwarded_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          reportId,
          authority_name.trim(),
          department?.trim() || null,
          reference_number?.trim() || null,
          forwarding_channel?.trim() || null,
          notes?.trim() || null,
          adminId
        ]
      );

      // Update status only if it has changed
      if (oldStatus !== "In Progress") {
        await client.query(
          `UPDATE reports
           SET status = 'In Progress'
           WHERE id = $1`,
          [reportId]
        );

        // Record status history
        await client.query(
          `INSERT INTO report_status_history
           (
             report_id,
             old_status,
             new_status,
             changed_by,
             reason
           )
           VALUES ($1, $2, $3, $4, $5)`,
          [
            reportId,
            oldStatus,
            "In Progress",
            adminId,
            "Report forwarded to " + authority_name.trim()
          ]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Report forwarded successfully.",
        forwarding: forwardingResult.rows[0],
        previousStatus: oldStatus,
        currentStatus: "In Progress"
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Report forwarding error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to forward report."
      });

    } finally {
      client.release();
    }
  }
);


// ==========================================
// RECORD AUTHORITY CONFIRMATION
// ADMIN ONLY
// ==========================================

router.post(
  "/reports/:id/confirmation",
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.id);
    const adminId = (req as AuthRequest).userId;

    const {
      forwarding_id,
      confirmation_source,
      confirmation_date,
      reference_number,
      evidence_details,
      evidence_file_path
    } = req.body;

    // Validate report ID
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID."
      });
    }

    // Validate forwarding ID
    if (
      !Number.isInteger(Number(forwarding_id)) ||
      Number(forwarding_id) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid forwarding ID is required."
      });
    }

    // Validate confirmation source
    if (
      typeof confirmation_source !== "string" ||
      !confirmation_source.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Confirmation source is required."
      });
    }

    // Validate confirmation date
    if (
      typeof confirmation_date !== "string" ||
      !confirmation_date.trim() ||
      Number.isNaN(Date.parse(confirmation_date))
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid confirmation date is required."
      });
    }

    const optionalFields = [
      reference_number,
      evidence_details,
      evidence_file_path
    ];

    if (
      optionalFields.some(
        value =>
          value !== undefined &&
          value !== null &&
          typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid confirmation details."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Check that forwarding belongs to this report
      const forwardingResult = await client.query(
        `SELECT rf.id, r.status
         FROM report_forwardings rf
         INNER JOIN reports r ON r.id = rf.report_id
         WHERE rf.id = $1
           AND rf.report_id = $2
         FOR UPDATE OF r`,
        [Number(forwarding_id), reportId]
      );

      if (forwardingResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Forwarding record not found for this report."
        });
      }

      const currentStatus = forwardingResult.rows[0].status;

      if (currentStatus !== "In Progress") {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message:
            "Authority confirmation can only be recorded for reports In Progress."
        });
      }

      // Save authority confirmation
      const confirmationResult = await client.query(
        `INSERT INTO authority_confirmations
         (
           forwarding_id,
           confirmation_source,
           confirmation_date,
           reference_number,
           evidence_details,
           evidence_file_path,
           verified_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          Number(forwarding_id),
          confirmation_source.trim(),
          confirmation_date,
          reference_number?.trim() || null,
          evidence_details?.trim() || null,
          evidence_file_path?.trim() || null,
          adminId
        ]
      );

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Authority confirmation recorded successfully.",
        confirmation: confirmationResult.rows[0]
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Authority confirmation error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to record authority confirmation."
      });

    } finally {
      client.release();
    }
  }
);


// ==========================================
// GET SUSPECTED DUPLICATE REPORTS
// ADMIN ONLY
// ==========================================

router.get("/duplicates", async (_req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
         d.id AS review_id,
         d.report_id,
         d.suspected_duplicate_id,
         d.review_status,
         d.primary_report_id,
         d.reviewed_by,
         d.review_notes,
         d.created_at,
         d.reviewed_at,

         r1.title AS report_title,
         r1.description AS report_description,
         r1.category AS report_category,
         r1.location AS report_location,
         r1.status AS report_status,

         r2.title AS duplicate_title,
         r2.description AS duplicate_description,
         r2.category AS duplicate_category,
         r2.location AS duplicate_location,
         r2.status AS duplicate_status,

         u.name AS reviewed_by_name

       FROM report_duplicate_reviews d

       INNER JOIN reports r1
         ON d.report_id = r1.id

       INNER JOIN reports r2
         ON d.suspected_duplicate_id = r2.id

       LEFT JOIN users u
         ON d.reviewed_by = u.id

       ORDER BY d.created_at DESC`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      duplicates: result.rows
    });

  } catch (error) {
    console.error("Duplicate reports fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch duplicate reports."
    });
  }
});


// ==========================================
// REVIEW SUSPECTED DUPLICATE
// ADMIN ONLY
// ==========================================

router.patch(
  "/duplicates/:id/review",
  async (req: Request, res: Response) => {
    const reviewId = Number(req.params.id);
    const adminId = (req as AuthRequest).userId;
    const { decision, review_notes } = req.body;

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID."
      });
    }

    if (!["not_duplicate", "confirmed_duplicate"].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review decision."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `SELECT id, review_status
         FROM report_duplicate_reviews
         WHERE id = $1
         FOR UPDATE`,
        [reviewId]
      );

      if (result.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Duplicate review not found."
        });
      }

      if (result.rows[0].review_status !== "pending") {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "This duplicate review has already been processed."
        });
      }

      const updated = await client.query(
        `UPDATE report_duplicate_reviews
         SET review_status = $1,
             reviewed_by = $2,
             review_notes = $3,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [
          decision,
          adminId,
          typeof review_notes === "string"
            ? review_notes.trim() || null
            : null,
          reviewId
        ]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Duplicate review completed.",
        review: updated.rows[0]
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Duplicate review error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to review duplicate."
      });

    } finally {
      client.release();
    }
  }
);


// ==========================================
// MERGE CONFIRMED DUPLICATE REPORT
// ADMIN ONLY
// ==========================================

router.post(
  "/duplicates/:id/merge",
  async (req: Request, res: Response) => {
    const reviewId = Number(req.params.id);
    const adminId = (req as AuthRequest).userId;
    const primaryReportId = Number(req.body.primary_report_id);

    if (
      !Number.isInteger(reviewId) ||
      reviewId <= 0 ||
      !Number.isInteger(primaryReportId) ||
      primaryReportId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid review ID and primary report ID are required."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const reviewResult = await client.query(
        `SELECT *
         FROM report_duplicate_reviews
         WHERE id = $1
         FOR UPDATE`,
        [reviewId]
      );

      if (reviewResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "Duplicate review not found."
        });
      }

      const review = reviewResult.rows[0];

      if (review.review_status !== "confirmed_duplicate") {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Only confirmed duplicates can be merged."
        });
      }

      const duplicateReportId = Number(review.suspected_duplicate_id);

      if (
        primaryReportId !== Number(review.report_id) &&
        primaryReportId !== duplicateReportId
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Primary report must be one of the two reviewed reports."
        });
      }

      const mergedReportId =
        primaryReportId === Number(review.report_id)
          ? duplicateReportId
          : Number(review.report_id);

      const reportIds = [primaryReportId, mergedReportId].sort(
        (a, b) => a - b
      );

      const reportsResult = await client.query(
        `SELECT id, merged_into_report_id
         FROM reports
         WHERE id = ANY($1::int[])
         ORDER BY id
         FOR UPDATE`,
        [reportIds]
      );

      if (reportsResult.rows.length !== 2) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,
          message: "One or both reports were not found."
        });
      }

      const primaryReport = reportsResult.rows.find(
        (r: { id: number }) => Number(r.id) === primaryReportId
      );

      const mergedReport = reportsResult.rows.find(
        (r: { id: number }) => Number(r.id) === mergedReportId
      );

      if (primaryReport.merged_into_report_id !== null) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Primary report is already merged into another report."
        });
      }

      if (mergedReport.merged_into_report_id !== null) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          success: false,
          message: "Duplicate report is already merged."
        });
      }

      // Preserve original report and link it to primary
      await client.query(
        `UPDATE reports
         SET merged_into_report_id = $1,
             merged_at = CURRENT_TIMESTAMP,
             merged_by = $2
         WHERE id = $3`,
        [primaryReportId, adminId, mergedReportId]
      );

      await client.query(
        `UPDATE report_duplicate_reviews
         SET review_status = 'merged',
             primary_report_id = $1,
             reviewed_by = $2,
             reviewed_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [primaryReportId, adminId, reviewId]
      );

      await client.query("COMMIT");

      return res.json({
        success: true,
        message: "Duplicate report merged successfully.",
        primary_report_id: primaryReportId,
        merged_report_id: mergedReportId
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Duplicate merge error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to merge duplicate reports."
      });

    } finally {
      client.release();
    }
  }
);

export default router;
