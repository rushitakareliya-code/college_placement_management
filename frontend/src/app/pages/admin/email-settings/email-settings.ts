import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { EmailService, SmtpConfig, QueueStatus } from '../../../services/email.service';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './email-settings.html',
})
export class EmailSettings implements OnInit, OnDestroy {

  // ── form model ──────────────────────────────────────────────────────────────
  form: SmtpConfig = {
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    secure: false,
    user: '',
    password: '',
    fromName: 'Placement Portal',
    fromEmail: 'noreply@placementhub.dev',
  };

  // ── UI state ─────────────────────────────────────────────────────────────────
  isLoading         = true;
  isSaving          = false;
  isDeleting        = false;
  isTesting         = false;
  configExists      = false;   // true = saved in DB
  showPassword      = false;
  mailtrapHelpOpen  = false;   // accordion for Mailtrap help

  successMessage    = '';
  errorMessage      = '';
  testTo            = '';
  testResult        = '';
  testResultType: 'success' | 'error' | '' = '';

  // ── queue ────────────────────────────────────────────────────────────────────
  queue: QueueStatus = { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 };
  queueOffline      = false;
  queueLastUpdated  = '';

  private queuePollSub?: Subscription;

  constructor(
    private emailService: EmailService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadConfig();
    this.startQueuePolling();
  }

  ngOnDestroy(): void {
    this.queuePollSub?.unsubscribe();
  }

  // ── config ───────────────────────────────────────────────────────────────────
  loadConfig(): void {
    this.isLoading = true;
    this.emailService.getConfig().subscribe({
      next: (config: any) => {
        if (config) {
          // Pre-fill form; password always cleared (never sent from server)
          this.form = {
            host:      config.host      || 'sandbox.smtp.mailtrap.io',
            port:      config.port      || 2525,
            secure:    config.secure    || false,
            user:      config.user      || '',
            password:  '',
            fromName:  config.fromName  || 'Placement Portal',
            fromEmail: config.fromEmail || 'noreply@placementhub.dev',
          };
          this.configExists = !!config._fromDb;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  /** Fill host/port/secure with Mailtrap sandbox values */
  applyMailtrapPreset(): void {
    this.form.host   = 'sandbox.smtp.mailtrap.io';
    this.form.port   = 2525;
    this.form.secure = false;
  }

  saveConfig(): void {
    this.clearAlerts();
    this.isSaving = true;
    this.emailService.saveConfig(this.form).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.configExists   = true;
        this.form.password  = ''; // clear password field after save
        this.isSaving       = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.clearAlerts(); this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to save SMTP configuration.';
        this.isSaving     = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteConfig(): void {
    if (!confirm('Remove SMTP configuration? Emails will stop working until you save new settings.')) return;
    this.clearAlerts();
    this.isDeleting = true;
    this.emailService.deleteConfig().subscribe({
      next: (res) => {
        this.successMessage = res.message;
        this.configExists   = false;
        // Reset to Mailtrap defaults
        this.form = {
          host: 'sandbox.smtp.mailtrap.io',
          port: 2525,
          secure: false,
          user: '',
          password: '',
          fromName: 'Placement Portal',
          fromEmail: 'noreply@placementhub.dev',
        };
        this.isDeleting = false;
        this.cdr.detectChanges();
        setTimeout(() => { this.clearAlerts(); this.cdr.detectChanges(); }, 5000);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to remove configuration.';
        this.isDeleting   = false;
        this.cdr.detectChanges();
      },
    });
  }

  sendTest(): void {
    if (!this.testTo) {
      this.testResult     = 'Please enter a recipient email.';
      this.testResultType = 'error';
      return;
    }
    this.isTesting      = true;
    this.testResult     = '';
    this.testResultType = '';
    this.emailService.sendTestEmail(this.testTo).subscribe({
      next: (res) => {
        this.testResult     = res.message;
        this.testResultType = 'success';
        this.isTesting      = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.testResult     = err?.error?.message || 'Test email failed.';
        this.testResultType = 'error';
        this.isTesting      = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ── queue polling ─────────────────────────────────────────────────────────────
  private startQueuePolling(): void {
    this.refreshQueue();
    this.queuePollSub = interval(10000)
      .pipe(switchMap(() => this.emailService.getQueueStatus()))
      .subscribe({
        next: (s) => { this.applyQueueStatus(s); this.cdr.detectChanges(); },
        error: () => { this.queueOffline = true; this.cdr.detectChanges(); },
      });
  }

  refreshQueue(): void {
    this.emailService.getQueueStatus().subscribe({
      next: (s) => { this.applyQueueStatus(s); this.cdr.detectChanges(); },
      error: () => { this.queueOffline = true; this.cdr.detectChanges(); },
    });
  }

  private applyQueueStatus(s: QueueStatus): void {
    this.queue            = s;
    this.queueOffline     = s.redisOffline === true;
    this.queueLastUpdated = new Date().toLocaleTimeString();
  }

  clearAlerts(): void {
    this.successMessage = '';
    this.errorMessage   = '';
  }
}
