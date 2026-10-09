'use client';

import { useState, useTransition } from 'react';
import { sendContactMessage } from '@/app/actions/admin';

export default function ContactFormClient({ isAr }: { isAr: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      try {
        await sendContactMessage(formData);
        setSent(true);
        form.reset();
      } catch (err: any) {
        setError(err?.message || (isAr ? 'حدث خطأ أثناء الإرسال.' : 'Une erreur est survenue lors de l\'envoi.'));
      }
    });
  }

  return (
    <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-200/50 border border-gray-100">
      <h2 className="text-2xl font-bold text-[#111827] mb-2 flex items-center gap-3">
        <span>✉️</span>
        <span>{isAr ? 'أرسل لنا رسالة' : 'Envoyez-nous un message'}</span>
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        {isAr 
          ? 'املأ النموذج أدناه وسيقوم فريقنا بالرد عليك في أقرب وقت.'
          : 'Remplissez le formulaire ci-dessous et notre équipe vous répondra dans les plus brefs délais.'}
      </p>

      {sent ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-fade-in">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
            ✓
          </div>
          <h3 className="text-lg font-bold text-green-900 mb-1">
            {isAr ? 'تم إرسال رسالتك بنجاح !' : 'Message envoyé avec succès !'}
          </h3>
          <p className="text-sm text-green-700 mb-5">
            {isAr 
              ? 'شكراً لتواصلك معنا. سنرد على بريدك أو هاتفك قريباً.'
              : 'Merci pour votre prise de contact. Nous reviendrons vers vous très rapidement.'}
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs font-semibold text-green-800 underline hover:text-green-900"
          >
            {isAr ? 'إرسال رسالة أخرى' : 'Envoyer un autre message'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {isAr ? 'الاسم الكامل *' : 'Nom complet *'}
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={isAr ? 'محمد الإدريسي' : 'Karim Alami'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {isAr ? 'البريد الإلكتروني *' : 'Email *'}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="votre@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {isAr ? 'رقم الهاتف' : 'Téléphone'}
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="06 12 34 56 78"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                {isAr ? 'الموضوع' : 'Sujet'}
              </label>
              <input
                type="text"
                name="subject"
                placeholder={isAr ? 'استفسار عن حجز' : 'Demande d\'information'}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              {isAr ? 'رسالتك *' : 'Votre message *'}
            </label>
            <textarea
              name="message"
              rows={4}
              required
              placeholder={isAr ? 'اكتب رسالتك بالتفصيل هنا...' : 'Détaillez votre demande ou votre projet de location...'}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#D4A72C] focus:border-transparent outline-none transition resize-none bg-gray-50/50 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-[#111827] text-white py-4 rounded-xl font-bold hover:bg-[#D4A72C] hover:text-[#111827] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="animate-spin inline-block">⏳</span>
                <span>{isAr ? 'جاري الإرسال...' : 'Envoi en cours...'}</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>{isAr ? 'إرسال الرسالة الآن' : 'Envoyer le message maintenant'}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
