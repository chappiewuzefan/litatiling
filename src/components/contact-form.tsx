"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TurnstileWidget } from "@/components/turnstile-widget";
import type { ContactFormContent } from "@/lib/content";
import type { Locale } from "@/lib/site-config";

declare global {
  interface Window {
    gtag_report_lead_form_conversion?: (callback: () => void) => boolean;
  }
}

type ContactFormProps = {
  locale: Locale;
  content: ContactFormContent;
  sourcePage: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  serviceType: string;
  projectType: string;
  preferredLanguage: string;
  message: string;
  company: string;
};

type FieldErrors = {
  name: string;
  phone: string;
  email: string;
  suburb: string;
  serviceType: string;
  projectType: string;
  message: string;
};

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

const initialState: FormState = {
  name: "",
  phone: "",
  email: "",
  suburb: "",
  serviceType: "",
  projectType: "",
  preferredLanguage: "",
  message: "",
  company: "",
};

export function ContactForm({
  locale,
  content,
  sourcePage,
}: ContactFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    ...initialState,
    preferredLanguage: locale,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({
    name: "",
    phone: "",
    email: "",
    suburb: "",
    serviceType: "",
    projectType: "",
    message: "",
  });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetCounter, setTurnstileResetCounter] = useState(0);
  const requiresTurnstile = Boolean(turnstileSiteKey);

  function getClientValidationErrors() {
    return {
      name: formState.name.trim() ? "" : content.validation.nameRequired,
      phone: formState.phone.trim() ? "" : content.validation.phoneRequired,
      email: formState.email.trim() ? "" : content.validation.emailRequired,
      suburb: formState.suburb.trim() ? "" : content.validation.suburbRequired,
      serviceType: formState.serviceType
        ? ""
        : content.validation.serviceTypeRequired,
      projectType: formState.projectType
        ? ""
        : content.validation.projectTypeRequired,
      message: formState.message.trim() ? "" : content.validation.messageRequired,
    };
  }

  function localizeApiMessage(message: string) {
    if (message === "Please complete all required fields.") {
      return content.validation.requiredFields;
    }

    return message;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const nextFieldErrors = getClientValidationErrors();
    setFieldErrors(nextFieldErrors);

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setErrorMessage(content.validation.requiredFields);
      return;
    }

    if (requiresTurnstile && !turnstileToken) {
      setErrorMessage(content.securityCheckRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formState,
          sourcePage,
          preferredLanguage: formState.preferredLanguage || locale,
          turnstileToken,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(payload?.message || content.errorFallback);
      }

      const thanksPath = `/${locale}/thanks`;

      if (
        typeof window !== "undefined" &&
        typeof window.gtag_report_lead_form_conversion === "function"
      ) {
        let didNavigate = false;
        const navigateToThanks = () => {
          if (didNavigate) {
            return;
          }

          didNavigate = true;
          router.push(thanksPath);
        };

        window.gtag_report_lead_form_conversion(navigateToThanks);
        window.setTimeout(navigateToThanks, 1000);
      } else {
        router.push(thanksPath);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? localizeApiMessage(error.message)
          : content.errorFallback;
      setErrorMessage(message);
      if (requiresTurnstile) {
        setTurnstileResetCounter((current) => current + 1);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));

    if (key === "serviceType" || key === "projectType") {
      const nextValue = typeof value === "string" ? value : "";
      setFieldErrors((current) => ({
        ...current,
        [key]: nextValue
          ? ""
          : key === "serviceType"
            ? content.validation.serviceTypeRequired
            : content.validation.projectTypeRequired,
      }));
    }

    if (
      key === "name" ||
      key === "phone" ||
      key === "email" ||
      key === "suburb" ||
      key === "message"
    ) {
      const nextValue = typeof value === "string" ? value.trim() : "";
      setFieldErrors((current) => ({
        ...current,
        [key]: nextValue
          ? ""
          : key === "name"
            ? content.validation.nameRequired
            : key === "phone"
              ? content.validation.phoneRequired
              : key === "email"
                ? content.validation.emailRequired
                : key === "suburb"
                  ? content.validation.suburbRequired
                  : content.validation.messageRequired,
      }));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] md:p-8"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="font-heading text-2xl font-semibold text-slate-950">
          {content.title}
        </h2>
        <p className="text-sm leading-6 text-slate-600">{content.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.name}</span>
          <input
            type="text"
            value={formState.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder={content.placeholders.name}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.name
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.name)}
            autoComplete="name"
            required
          />
          {fieldErrors.name ? (
            <p className="text-sm text-rose-700">{fieldErrors.name}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.phone}</span>
          <input
            type="tel"
            value={formState.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            placeholder={content.placeholders.phone}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.phone
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.phone)}
            autoComplete="tel"
            required
          />
          {fieldErrors.phone ? (
            <p className="text-sm text-rose-700">{fieldErrors.phone}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.email}</span>
          <input
            type="email"
            value={formState.email}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder={content.placeholders.email}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.email
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            required
          />
          {fieldErrors.email ? (
            <p className="text-sm text-rose-700">{fieldErrors.email}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.suburb}</span>
          <input
            type="text"
            value={formState.suburb}
            onChange={(event) => updateField("suburb", event.target.value)}
            placeholder={content.placeholders.suburb}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.suburb
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.suburb)}
            autoComplete="address-level2"
            required
          />
          {fieldErrors.suburb ? (
            <p className="text-sm text-rose-700">{fieldErrors.suburb}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.serviceType}</span>
          <select
            value={formState.serviceType}
            onChange={(event) => updateField("serviceType", event.target.value)}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.serviceType
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.serviceType)}
            required
          >
            <option value="">{locale === "zh" ? "请选择" : "Select"}</option>
            {content.serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.serviceType ? (
            <p className="text-sm text-rose-700">{fieldErrors.serviceType}</p>
          ) : null}
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-800">
          <span>{content.fields.projectType}</span>
          <select
            value={formState.projectType}
            onChange={(event) => updateField("projectType", event.target.value)}
            className={`w-full rounded-2xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
              fieldErrors.projectType
                ? "border-rose-300 bg-rose-50 focus:border-rose-500"
                : "border-slate-200 bg-slate-50 focus:border-sky-500"
            }`}
            aria-invalid={Boolean(fieldErrors.projectType)}
            required
          >
            <option value="">{locale === "zh" ? "请选择" : "Select"}</option>
            {content.projectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldErrors.projectType ? (
            <p className="text-sm text-rose-700">{fieldErrors.projectType}</p>
          ) : null}
        </label>
      </div>

      <label className="space-y-2 text-sm font-medium text-slate-800">
        <span>{content.fields.preferredLanguage}</span>
        <select
          value={formState.preferredLanguage}
          onChange={(event) =>
            updateField("preferredLanguage", event.target.value)
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
        >
          {content.languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2 text-sm font-medium text-slate-800">
        <span>{content.fields.message}</span>
        <textarea
          value={formState.message}
          onChange={(event) => updateField("message", event.target.value)}
          placeholder={content.placeholders.message}
          className={`min-h-36 w-full rounded-3xl border px-4 py-3 text-slate-900 outline-none transition focus:bg-white ${
            fieldErrors.message
              ? "border-rose-300 bg-rose-50 focus:border-rose-500"
              : "border-slate-200 bg-slate-50 focus:border-sky-500"
          }`}
          aria-invalid={Boolean(fieldErrors.message)}
          required
        />
        {fieldErrors.message ? (
          <p className="text-sm text-rose-700">{fieldErrors.message}</p>
        ) : null}
      </label>

      <label className="sr-only" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={formState.company}
          onChange={(event) => updateField("company", event.target.value)}
        />
      </label>

      {requiresTurnstile ? (
        <TurnstileWidget
          siteKey={turnstileSiteKey}
          locale={locale}
          label={content.securityCheckLabel}
          resetCounter={turnstileResetCounter}
          onTokenChange={setTurnstileToken}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSubmitting ? content.submittingLabel : content.submitLabel}
        </button>
        {errorMessage ? (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errorMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
