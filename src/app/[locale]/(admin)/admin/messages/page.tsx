import prisma from '@/lib/db';
import { requirePermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import AdminMessagesClient, { AdminMessageItem } from './AdminMessagesClient';

export default async function AdminMessagesPage() {
  try {
    await requirePermission('messages');
  } catch {
    redirect('/fr/admin');
  }

  // Fetch messages from database
  let rawMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // If no message in DB yet, create starter messages so admin has demonstration data
  if (rawMessages.length === 0) {
    const seedMsgs = [
      {
        name: 'Karim Bennani',
        email: 'karim.b@gmail.com',
        phone: '06 61 22 33 44',
        subject: 'Demande de devis pour location longue durée (Duster)',
        message: 'Bonjour, je souhaiterais louer la Dacia Duster pour une durée de 3 semaines à compter du 15 novembre à Casablanca. Avez-vous un tarif dégressif pour cette durée ? Merci d\'avance.',
        isRead: false,
      },
      {
        name: 'Sara Mansouri',
        email: 'sara.m@outlook.com',
        phone: '06 72 88 99 00',
        subject: 'Livraison à l\'Aéroport Mohammed V de Casablanca',
        message: 'Bonjour, est-il possible de récupérer la Dacia Logan directement au terminal 2 de l\'aéroport Mohammed V à 22h30 ? Quels sont les frais additionnels ? Cordialement.',
        isRead: true,
      },
      {
        name: 'Mehdi El Fassi',
        email: 'mehdi.elfassi@company.ma',
        phone: '06 50 11 22 33',
        subject: 'Disponibilité Hyundai Tucson Hybride',
        message: 'Bonjour l\'équipe ILYMED CAR, le Tucson est-il équipé d\'un siège bébé et du GPS intégré ? Je prévois un voyage à Marrakech le week-end prochain.',
        isRead: true,
      },
    ];

    for (const m of seedMsgs) {
      await prisma.contactMessage.create({ data: m });
    }

    rawMessages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  const messages: AdminMessageItem[] = rawMessages.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    subject: m.subject,
    message: m.message,
    isRead: m.isRead,
    createdAt: m.createdAt.toISOString(),
  }));

  return <AdminMessagesClient initialMessages={messages} />;
}
