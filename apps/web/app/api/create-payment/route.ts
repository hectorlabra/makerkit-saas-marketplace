import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    
    const preference = new Preference(client);
    
    const result = await preference.create({
      body: {
        items: data.items.map(item => ({
          id: item.id,
          title: item.title,
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: 'ARS' // O la moneda correspondiente
        })),
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
        },
        auto_return: 'approved',
      }
    });
    
    return NextResponse.json({ preferenceId: result.id });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}