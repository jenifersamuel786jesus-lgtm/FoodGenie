import { GoogleGenAI, Type } from '@google/genai';
import type { FoodItemData, RestaurantData } from './seedData.ts';

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
];

function getGenAIClient() {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildSmartLocalRecommendations(
  prompt: string,
  dietaryPreference: 'ALL' | 'VEG' | 'NON_VEG',
  filteredItems: FoodItemData[]
) {
  const q = prompt.toLowerCase();
  const scored = filteredItems.map((item) => {
    let score = item.ratings * 10;
    if (q.includes('pizza') && item.name.toLowerCase().includes('pizza')) score += 40;
    if (q.includes('burger') && item.name.toLowerCase().includes('burger')) score += 40;
    if (q.includes('fries') && item.name.toLowerCase().includes('fries')) score += 35;
    if (
      (q.includes('healthy') || q.includes('bowl') || q.includes('light') || q.includes('550') || q.includes('calorie')) &&
      item.calories <= 560
    ) {
      score += 40;
    }
    if (
      (q.includes('protein') || q.includes('workout') || q.includes('grill') || q.includes('skewer')) &&
      (item.name.toLowerCase().includes('skewer') ||
        item.name.toLowerCase().includes('steak') ||
        item.name.toLowerCase().includes('burger'))
    ) {
      score += 35;
    }
    if (q.includes('pasta') && item.name.toLowerCase().includes('pasta')) score += 40;
    if (q.includes('truffle') && item.name.toLowerCase().includes('truffle')) score += 35;
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topThree = scored.slice(0, 3).map(({ item }) => ({
    itemId: item._id,
    name: item.name,
    restaurantName: item.restaurantName,
    whyItMatches: `${item.description.split('.')[0]}. Prepared fresh in ${item.prepTime} (${item.calories} kcal, rated ${item.ratings}★).`,
    pairingTip: item.isVeg
      ? 'Pairs wonderfully with warm Rosemary Garlic Bread or a chilled sparkling citrus drink.'
      : 'Pairs great with Crispy Rosemary Parmesan Fries or a fresh side salad.',
  }));

  return {
    conciergeNote: `FoodGenie curated these top-rated ${
      dietaryPreference === 'VEG'
        ? 'pure vegetarian '
        : dietaryPreference === 'NON_VEG'
        ? 'chef-special '
        : ''
    }dishes tailored to "${prompt}":`,
    recommendations: topThree,
  };
}

function buildSmartLocalReviewReport(restaurant: RestaurantData) {
  const score = Math.min(99, Math.round(restaurant.ratings * 20));
  const dishes = restaurant.reviews
    .map((r) => r.dishMentioned)
    .filter((d): d is string => Boolean(d));

  return {
    overallSentiment:
      restaurant.ratings >= 4.8 ? 'Highly Acclaimed by Diners' : 'Consistently Positive',
    sentimentScore: score,
    executiveSummary: `Diners consistently praise ${restaurant.name} for its fresh ingredients, authentic ${restaurant.cuisine[0]} preparation, and reliable ${restaurant.deliveryTime} delivery window across ${restaurant.numOfReviews} verified orders.`,
    keyStrengths: [
      `Authentic ${restaurant.cuisine.slice(0, 2).join(' & ')} flavor profile`,
      `Fast and temperature-controlled delivery (${restaurant.deliveryTime})`,
      `High diner repeat rate with a ${restaurant.ratings.toFixed(1)}/5 average rating`,
    ],
    standoutDishes:
      dishes.length > 0 ? Array.from(new Set(dishes)) : restaurant.cuisine,
    PackagingAndDeliveryNote:
      'Hot and cold items are packed in separate insulated containers to preserve texture and crispness upon arrival.',
  };
}

export async function generateDishRecommendations(
  prompt: string,
  dietaryPreference: 'ALL' | 'VEG' | 'NON_VEG',
  allItems: FoodItemData[]
) {
  const filteredItems = allItems.filter((item) => {
    if (dietaryPreference === 'VEG') return item.isVeg;
    if (dietaryPreference === 'NON_VEG') return !item.isVeg;
    return true;
  });

  const catalogForPrompt = filteredItems.map((item) => ({
    itemId: item._id,
    name: item.name,
    restaurantName: item.restaurantName,
    restaurantId: item.restaurant,
    price: item.price,
    isVeg: item.isVeg,
    calories: item.calories,
    description: item.description,
  }));

  if (!process.env.GEMINI_API_KEY) {
    return buildSmartLocalRecommendations(prompt, dietaryPreference, filteredItems);
  }

  const ai = getGenAIClient();

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `User Craving / Request: "${prompt}"
Dietary Filter: ${dietaryPreference}

Available Catalog Items:
${JSON.stringify(catalogForPrompt, null, 2)}

Select the best 2 to 3 dishes from the catalog that match the user's craving, mood, or nutritional goal. Return only items that exist in the catalog above.`,
        config: {
          systemInstruction:
            'You are FoodGenie, a smart AI Food Assistant. Always respond in clear, plain English. Recommend real menu items from the provided catalog with simple, appetizing reasons and side dish pairing suggestions.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              conciergeNote: {
                type: Type.STRING,
                description:
                  'A warm 1-2 sentence FoodGenie note addressing the user request.',
              },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    itemId: { type: Type.STRING },
                    name: { type: Type.STRING },
                    restaurantName: { type: Type.STRING },
                    whyItMatches: { type: Type.STRING },
                    pairingTip: { type: Type.STRING },
                  },
                  required: [
                    'itemId',
                    'name',
                    'restaurantName',
                    'whyItMatches',
                    'pairingTip',
                  ],
                },
              },
            },
            required: ['conciergeNote', 'recommendations'],
          },
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(
        `[FoodGenie AI] Model ${modelName} busy or unavailable (${err?.status || err?.message}), trying next...`
      );
    }
  }

  // Graceful fallback if all models experience a temporary 503 demand spike
  return buildSmartLocalRecommendations(prompt, dietaryPreference, filteredItems);
}

export async function analyzeRestaurantReviews(restaurant: RestaurantData) {
  if (!process.env.GEMINI_API_KEY) {
    return buildSmartLocalReviewReport(restaurant);
  }

  const ai = getGenAIClient();

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: `Analyze the customer reviews for restaurant "${restaurant.name}" (${restaurant.cuisine.join(', ')}).
Current Rating: ${restaurant.ratings}/5 (${restaurant.numOfReviews} total reviews).

Recent Verified Reviews:
${JSON.stringify(restaurant.reviews, null, 2)}`,
        config: {
          systemInstruction:
            'You are FoodGenie Review Analyzer. Synthesize verified customer feedback into a structured, objective restaurant quality report in plain English.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallSentiment: {
                type: Type.STRING,
                description: 'Positive, Highly Acclaimed, Mixed, or Needs Attention',
              },
              sentimentScore: {
                type: Type.NUMBER,
                description: 'Score from 0 to 100 based on diner satisfaction',
              },
              executiveSummary: {
                type: Type.STRING,
                description:
                  'Concise 2-sentence synthesis of what diners love and experience.',
              },
              keyStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              standoutDishes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              PackagingAndDeliveryNote: {
                type: Type.STRING,
              },
            },
            required: [
              'overallSentiment',
              'sentimentScore',
              'executiveSummary',
              'keyStrengths',
              'standoutDishes',
              'PackagingAndDeliveryNote',
            ],
          },
        },
      });

      const text = response.text;
      if (text) {
        return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn(
        `[FoodGenie AI] Review model ${modelName} busy (${err?.status || err?.message}), trying next...`
      );
    }
  }

  return buildSmartLocalReviewReport(restaurant);
}
