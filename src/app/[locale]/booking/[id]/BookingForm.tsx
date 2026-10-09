'use client';

import { useState, useTransition } from 'react';
import { submitBooking } from '@/app/actions/booking';

interface Props {
  vehicleId:       string;
  locale:          string;
  dailyPrice:      number;
  securityDeposit: number;
  deliveryFee:     number;
  vehicleName:     string;
  primaryImage:    string;
  currentUser?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | null;
}

export default function BookingForm({
  vehicleId,
  locale,
  dailyPrice,
  securityDeposit,
  deliveryFee,
  vehicleName,
  primaryImage,
  currentUser,
}: Props) {
  const isAr = locale === 'ar';

  // ── State ────────────────────────────────────────────────────────────────
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [dateError, setDateError]   = useState('');
  const [formError, setFormError]   = useState('');
  const [isPending, startTransition] = useTransition();

  // ── Derived pricing ──────────────────────────────────────────────────────
  const days = (() => {
    if (!pickupDate || !returnDate) return 0;
    const d = Math.ceil(
      (new Date(returnDate).getTime() - new Date(pickupDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return d > 0 ? d : 0;
  })();

  const rentalAmount = days * dailyPrice;
  const serviceFee   = days > 0 ? Math.max(15, rentalAmount * 0.1) : 0;
  const taxAmount    = rentalAmount * 0.1;
  const total        = rentalAmount + serviceFee + taxAmount + (days > 0 ? deliveryFee : 0);

  // ── Handlers ─────────────────────────────────────────────────────────────
  function validateDates(pickup: string, ret: string) {
    if (pickup && ret && new Date(ret) <= new Date(pickup)) {
      setDateError(
        isAr
          ? 'يجب أن يكون تاريخ الإرجاع بعد تاريخ الاستلام.'
          : 'La date de retour doit être après la date de départ.',
      );
    } else {
      setDateError('');
    }
  }

  function handlePickupChange(v: string) {
    setPickupDate(v);
    validateDates(v, returnDate);
  }

  function handleReturnChange(v: string) {
    setReturnDate(v);
    validateDates(pickupDate, v);
  }

  async function handleSubmit(formData: FormData) {
    if (dateError) return;
    setFormError('');
    startTransition(async () => {
      try {
        await submitBooking(formData);
      } catch (err: unknown) {
        if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
          setFormError(err.message);
        }
      }
    });
  }

  // ── Labels ───────────────────────────────────────────────────────────────
  const t = {
    tripDates:       isAr ? 'تواريخ الرحلة'                    : 'Dates du voyage',
    pickup:          isAr ? 'تاريخ الاستلام'                   : 'Date de prise en charge',
    return:          isAr ? 'تاريخ الإرجاع'                    : 'Date de retour',
    yourInfo:        isAr ? 'معلوماتك'                         : 'Vos informations',
    firstName:       isAr ? 'الاسم الشخصي'                     : 'Prénom',
    lastName:        isAr ? 'الاسم العائلي'                    : 'Nom',
    email:           isAr ? 'البريد الإلكتروني'                : 'Adresse e-mail',
    phone:           isAr ? 'رقم الهاتف'                       : 'Téléphone',
    license:         isAr ? 'رخصة القيادة'                     : 'Permis de conduire',
    licenseNo:       isAr ? 'رقم رخصة القيادة'                 : 'Numéro de permis',
    certify:         isAr ? 'أُقرّ بأن لدي رخصة سارية المفعول' : 'Je certifie avoir un permis valide',
    requests:        isAr ? 'طلبات خاصة'                       : 'Demandes spéciales',
    requestsHelper:  isAr ? 'أي طلبات أو ملاحظات إضافية...'   : 'Toute demande ou remarque supplémentaire...',
    submit:          isAr ? 'تأكيد الحجز'                      : 'Confirmer la réservation',
    processing:      isAr ? 'جارٍ المعالجة...'                 : 'Traitement en cours...',
    rentalLabel:     isAr ? 'الإيجار'                          : 'Location',
    serviceFeeLabel: isAr ? 'رسوم الخدمة'                      : 'Frais de service',
    taxLabel:        isAr ? 'الضرائب (10%)'                    : 'Taxes (10%)',
    depositLabel:    isAr ? 'الضمان المسترد'                   : 'Dépôt de garantie',
    totalLabel:      isAr ? 'المجموع'                          : 'Total',
    depositNote:     isAr
      ? 'سيتم استرداد وديعة الضمان في نهاية الإيجار.'
      : 'Le dépôt de garantie sera restitué à la fin de la location.',
    dayLabel:        isAr ? 'يوم' : 'jour',
    daysLabel:       isAr ? 'أيام' : 'jours',
    priceBreakdown:  isAr ? 'تفصيل السعر' : 'Détail du prix',
    selectDates:     isAr ? 'اختر التواريخ لرؤية الإجمالي' : 'Sélectionnez les dates pour voir le total',
  };

  return (
    <form action={handleSubmit} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Hidden inputs */}
      <input type="hidden" name="vehicleId"  value={vehicleId} />
      <input type="hidden" name="locale"     value={locale} />
      <input type="hidden" name="pickupDate" value={pickupDate} />
      <input type="hidden" name="returnDate" value={returnDate} />

      <div className="flex flex-col lg:flex-row gap-8">

        {/* ── LEFT column ────────────────────────────────────────────── */}
        <div className="w-full lg:w-2/3 space-y-6">

          {/* Trip Dates */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#D4A72C] text-[#111827] text-xs font-bold flex items-center justify-center">1</span>
              {t.tripDates}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.pickup}
                </label>
                <input
                  type="date"
                  name="pickupDateDisplay"
                  value={pickupDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.return}
                </label>
                <input
                  type="date"
                  name="returnDateDisplay"
                  value={returnDate}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleReturnChange(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
            </div>
            {dateError && (
              <p className="text-red-500 text-sm mt-3">{dateError}</p>
            )}
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#D4A72C] text-[#111827] text-xs font-bold flex items-center justify-center">2</span>
                {t.yourInfo}
              </h2>
              {currentUser && (
                <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-medium">
                  <span>✓</span>
                  <span>{isAr ? 'تم ملء بيانات حسابك تلقائياً' : 'Rempli via votre compte connecté'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.firstName}
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  defaultValue={currentUser?.firstName || ''}
                  placeholder={t.firstName}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.lastName}
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  defaultValue={currentUser?.lastName || ''}
                  placeholder={t.lastName}
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.email}
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={currentUser?.email || ''}
                  placeholder="email@exemple.com"
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={currentUser?.phone || ''}
                  placeholder="+213 ..."
                  className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
                />
              </div>
            </div>
          </div>

          {/* Driver's License */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#D4A72C] text-[#111827] text-xs font-bold flex items-center justify-center">3</span>
              {t.license}
            </h2>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {t.licenseNo}
              </label>
              <input
                type="text"
                name="licenseNumber"
                required
                placeholder="ex: 123456789"
                className="w-full border border-gray-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
              />
            </div>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="licenseConfirm"
                required
                className="mt-0.5 w-4 h-4 accent-[#D4A72C] shrink-0"
              />
              <span className="text-sm text-gray-700 group-hover:text-[#111827] transition-colors">
                {t.certify}
              </span>
            </label>
          </div>

          {/* Special Requests */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[#D4A72C] text-[#111827] text-xs font-bold flex items-center justify-center">4</span>
              {t.requests}
            </h2>
            <textarea
              name="specialRequests"
              rows={4}
              placeholder={t.requestsHelper}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D4A72C]"
            />
          </div>

          {/* Form-level error */}
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {formError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending || !!dateError || !pickupDate || !returnDate}
            className="w-full bg-[#D4A72C] text-[#111827] py-4 rounded-2xl font-bold text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t.processing : t.submit}
          </button>
        </div>

        {/* ── RIGHT column — Price Summary ────────────────────────────── */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24 space-y-5">

            {/* Vehicle snapshot */}
            <div className="flex gap-3 items-center pb-4 border-b border-gray-100">
              <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0">
                <img
                  src={primaryImage}
                  alt={vehicleName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-[#111827] text-sm leading-tight">{vehicleName}</p>
                <p className="text-[#D4A72C] font-semibold text-sm mt-0.5">
                  {dailyPrice} DH / {t.dayLabel}
                </p>
              </div>
            </div>

            {/* Date range summary */}
            {pickupDate && returnDate && !dateError ? (
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{pickupDate}</span>
                <span className="text-[#D4A72C] font-bold">→</span>
                <span>{returnDate}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center">{t.selectDates}</p>
            )}

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t.rentalLabel} ({days} {days === 1 ? t.dayLabel : t.daysLabel})</span>
                <span>{days > 0 ? `${rentalAmount.toFixed(2)} DH` : '—'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t.serviceFeeLabel}</span>
                <span>{days > 0 ? `${serviceFee.toFixed(2)} DH` : '—'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>{t.taxLabel}</span>
                <span>{days > 0 ? `${taxAmount.toFixed(2)} DH` : '—'}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-gray-400">
                  <span>{isAr ? 'رسوم التوصيل' : 'Frais de livraison'}</span>
                  <span>{deliveryFee.toFixed(2)} DH</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>{t.depositLabel}</span>
                <span>{securityDeposit.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between font-bold pt-3 border-t border-gray-200 text-[#111827] text-base">
                <span>{t.totalLabel}</span>
                <span>{days > 0 ? `${total.toFixed(2)} DH` : '—'}</span>
              </div>
            </div>

            {/* Deposit note */}
            <p className="text-xs text-gray-400 bg-[#F8FAFC] rounded-xl px-3 py-2 leading-relaxed">
              ℹ️ {t.depositNote}
            </p>
          </div>
        </div>
      </div>
    </form>
  );
}
