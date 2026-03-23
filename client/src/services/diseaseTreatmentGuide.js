const HEALTHY_GUIDE = ({ crop }) => ({
    urgency: 'Low',
    summary: `No obvious disease pattern was detected on this ${crop.toLowerCase()} sample. Keep monitoring because early symptoms can still appear after weather changes or pest pressure.`,
    immediateActions: [
        'Keep regular irrigation and nutrition steady to avoid plant stress.',
        'Continue scouting nearby leaves and neighboring plants for any new spots or discoloration.',
        'Use this scan as a healthy baseline photo for future comparison.',
    ],
    preventionTips: [
        'Sanitize tools before moving between beds or rows.',
        'Avoid prolonged leaf wetness from late-evening overhead watering.',
        'Clear weeds and crop debris that can shelter pests and pathogens.',
    ],
    monitorNext: [
        'Check the same area again in 5 to 7 days.',
        'Re-scan immediately if you notice wilting, unusual spots, mold, or curling.',
    ],
});

const CONDITION_GUIDES = {
    'Apple_scab': {
        urgency: 'Medium',
        summary: 'Apple scab spreads quickly in wet weather and can scar leaves and fruit if early lesions are left unmanaged.',
        immediateActions: [
            'Remove badly infected leaves or fruit from the canopy and orchard floor.',
            'Improve airflow through pruning and spacing so foliage dries faster after rain.',
            'Start or tighten a labeled fungicide program if weather remains wet.',
        ],
        preventionTips: [
            'Destroy fallen leaf litter that can carry the fungus between seasons.',
            'Avoid dense canopy growth caused by excessive nitrogen.',
            'Scout young leaves after each rainy spell during active growth.',
        ],
        monitorNext: [
            'Recheck new growth within 3 to 5 days.',
            'Watch fruit clusters closely for olive-brown scabby lesions.',
        ],
    },
    'Black_rot': {
        urgency: 'High',
        summary: 'Black rot can move from infected tissue into fruit and stems, so sanitation and fast containment matter.',
        immediateActions: [
            'Prune out infected tissue and remove mummified fruit or dead canes from the field.',
            'Bag and discard infected material instead of leaving it near the crop.',
            'Use a labeled protective fungicide where black rot pressure is active.',
        ],
        preventionTips: [
            'Keep the canopy open to lower humidity and improve spray coverage.',
            'Sanitize tools between infected and healthy plants.',
            'Avoid leaving diseased fruit in storage or on the plant.',
        ],
        monitorNext: [
            'Inspect fruiting areas every 2 to 3 days during humid conditions.',
            'Look for sunken lesions, dark fruit rot, or expanding leaf spots.',
        ],
    },
    'Cedar_apple_rust': {
        urgency: 'Medium',
        summary: 'Cedar apple rust often intensifies when susceptible apples and nearby junipers are exposed to repeated moisture.',
        immediateActions: [
            'Remove heavily infected leaves if the outbreak is still localized.',
            'Reduce nearby alternate host pressure where juniper galls are present.',
            'Protect new flushes with a labeled rust fungicide during high-risk weather.',
        ],
        preventionTips: [
            'Keep tree vigor balanced with proper pruning and fertilization.',
            'Scout for orange lesions after wet spring periods.',
            'Separate susceptible varieties from infected juniper hosts where possible.',
        ],
        monitorNext: [
            'Inspect fresh leaves after the next rain event.',
            'Watch for expanding orange pustules or fruit symptoms.',
        ],
    },
    'Powdery_mildew': {
        urgency: 'Medium',
        summary: 'Powdery mildew can spread even without free water, especially when air circulation is poor and humidity stays high.',
        immediateActions: [
            'Remove badly infected leaves or shoots to lower spore pressure.',
            'Open up dense plant growth to improve airflow.',
            'Apply a labeled mildew treatment if new growth is still becoming infected.',
        ],
        preventionTips: [
            'Avoid excessive nitrogen that pushes soft, highly susceptible growth.',
            'Space plants well and prune crowded foliage.',
            'Scout the undersides of leaves and tender shoots every few days.',
        ],
        monitorNext: [
            'Recheck new growth in 3 to 4 days.',
            'Watch for white powdery patches spreading onto petioles or stems.',
        ],
    },
    'Cercospora_leaf_spot Gray_leaf_spot': {
        urgency: 'Medium',
        summary: 'Gray leaf spot on maize can reduce leaf area quickly when warm, humid conditions persist.',
        immediateActions: [
            'Mark the affected block and prioritize scouting in surrounding rows.',
            'Remove heavily infected lower leaves only if practical and sanitation can be maintained.',
            'Use a labeled foliar fungicide where disease pressure and crop stage justify it.',
        ],
        preventionTips: [
            'Rotate crops and manage infected residue after harvest.',
            'Improve field airflow by managing weeds and plant density.',
            'Avoid continuous maize on heavily infested fields if possible.',
        ],
        monitorNext: [
            'Reinspect the block within 3 days.',
            'Track whether rectangular lesions are moving upward into the canopy.',
        ],
    },
    'Common_rust_': {
        urgency: 'Medium',
        summary: 'Common rust usually starts as scattered pustules but can build fast on young maize under moderate temperatures.',
        immediateActions: [
            'Scout neighboring plants to estimate how widespread the outbreak is.',
            'Protect actively growing plants with a labeled fungicide if pustules are increasing quickly.',
            'Reduce stress from drought or nutrient imbalance so plants recover better.',
        ],
        preventionTips: [
            'Choose rust-tolerant seed where possible in future plantings.',
            'Keep volunteer maize and grassy hosts under control.',
            'Monitor fields early when cool nights and humid mornings are common.',
        ],
        monitorNext: [
            'Check upper leaves again within 4 days.',
            'Watch for pustules increasing in number or merging into larger damaged zones.',
        ],
    },
    'Northern_Leaf_Blight': {
        urgency: 'High',
        summary: 'Northern leaf blight can remove photosynthetic leaf area quickly and should be contained early in maize.',
        immediateActions: [
            'Scout the full block immediately to estimate the spread.',
            'Use a labeled fungicide program if lesions are active on important leaf layers.',
            'Reduce crop stress from water shortage or nutrient imbalance.',
        ],
        preventionTips: [
            'Rotate out of maize where disease pressure has been severe.',
            'Manage infected residue after harvest because the pathogen can overwinter there.',
            'Use tolerant hybrids when planting future cycles.',
        ],
        monitorNext: [
            'Inspect again in 2 to 3 days.',
            'Watch for cigar-shaped lesions extending upward toward the ear leaf.',
        ],
    },
    'Esca_(Black_Measles)': {
        urgency: 'High',
        summary: 'Esca is a trunk disease in grapevines and symptoms often return seasonally once vines are infected.',
        immediateActions: [
            'Flag affected vines so they can be monitored separately.',
            'Remove and destroy dead wood that may be harboring fungal inoculum.',
            'Limit pruning wounds during wet periods and protect large cuts where recommended.',
        ],
        preventionTips: [
            'Sanitize pruning tools between vines.',
            'Avoid unnecessary trunk injuries from equipment or rough handling.',
            'Replace severely declining vines when recovery is no longer practical.',
        ],
        monitorNext: [
            'Track vine vigor and canopy symptoms weekly.',
            'Watch for recurring tiger-stripe leaves, dieback, or berry spotting.',
        ],
    },
    'Leaf_blight_(Isariopsis_Leaf_Spot)': {
        urgency: 'Medium',
        summary: 'Grape leaf blight can spread through dense, humid canopies and reduce healthy leaf area if left unchecked.',
        immediateActions: [
            'Remove badly infected leaves where sanitation is feasible.',
            'Thin canopy growth to improve light penetration and airflow.',
            'Apply a labeled fungicide if new lesions continue to appear.',
        ],
        preventionTips: [
            'Avoid overhead irrigation that keeps leaves wet for long periods.',
            'Prune and train vines for better ventilation.',
            'Collect diseased leaf debris during cleanup rounds.',
        ],
        monitorNext: [
            'Inspect young leaves again within 3 to 5 days.',
            'Watch for lesion spread toward productive canopy zones.',
        ],
    },
    'Haunglongbing_(Citrus_greening)': {
        urgency: 'Critical',
        summary: 'Citrus greening has no curative treatment, so the priority is containment, psyllid control, and preventing spread to healthy trees.',
        immediateActions: [
            'Isolate and clearly mark the suspected tree or block immediately.',
            'Control citrus psyllid vectors using an approved local management program.',
            'Contact a local extension officer or plant health authority if removal is required in your area.',
        ],
        preventionTips: [
            'Use clean planting material from certified sources.',
            'Maintain aggressive psyllid monitoring and control.',
            'Remove severely affected trees promptly if advised by local regulations.',
        ],
        monitorNext: [
            'Inspect nearby citrus trees for blotchy mottling or misshapen fruit.',
            'Track vector presence weekly until the area is stabilized.',
        ],
    },
    'Bacterial_spot': {
        urgency: 'High',
        summary: 'Bacterial spot spreads easily with splashing water, handling, and contaminated tools, so clean sanitation matters fast.',
        immediateActions: [
            'Remove severely infected leaves or fruit and keep them out of the production area.',
            'Avoid overhead irrigation and field work while foliage is wet.',
            'Use a labeled bactericide program where local recommendations support it.',
        ],
        preventionTips: [
            'Disinfect cutting tools, harvest bins, and hands between plots.',
            'Improve spacing and airflow to shorten leaf wetness periods.',
            'Start with clean seed or transplants whenever possible.',
        ],
        monitorNext: [
            'Recheck the crop within 2 to 4 days.',
            'Watch for water-soaked lesions, shot holes, or fruit spotting on nearby plants.',
        ],
    },
    'Early_blight': {
        urgency: 'High',
        summary: 'Early blight can expand quickly on stressed solanaceous crops and reduce vigor long before harvest.',
        immediateActions: [
            'Remove the worst infected leaves to reduce spore load.',
            'Keep foliage dry by shifting irrigation away from overhead watering if possible.',
            'Begin a labeled fungicide program if lesions are actively expanding.',
        ],
        preventionTips: [
            'Mulch or manage soil splash to keep spores off lower leaves.',
            'Rotate away from the same crop family after harvest.',
            'Support balanced fertilization to reduce plant stress.',
        ],
        monitorNext: [
            'Inspect lower and middle canopy leaves again in 2 to 3 days.',
            'Watch for concentric ring lesions moving upward through the crop.',
        ],
    },
    'Late_blight': {
        urgency: 'Critical',
        summary: 'Late blight can destroy susceptible crops very quickly, especially in cool, wet conditions, so rapid containment is essential.',
        immediateActions: [
            'Separate the affected plants or rows from healthy areas as much as possible.',
            'Remove heavily infected foliage and bag it away from the field.',
            'Start an urgent labeled late blight fungicide program and tighten scouting frequency.',
        ],
        preventionTips: [
            'Avoid overhead irrigation and long leaf wetness periods.',
            'Destroy volunteer plants and cull piles that can keep inoculum alive.',
            'Use clean seed stock and resistant varieties when available.',
        ],
        monitorNext: [
            'Inspect the surrounding area within 24 hours.',
            'Watch for fast-moving water-soaked lesions, white growth, and stem infection.',
        ],
    },
    'Leaf_scorch': {
        urgency: 'Medium',
        summary: 'Leaf scorch symptoms can worsen under heat and water stress, so reducing stress and checking for secondary issues is important.',
        immediateActions: [
            'Stabilize irrigation so plants do not cycle between drought and saturation.',
            'Remove badly scorched leaves only if they are mostly dead and no longer useful.',
            'Check for root stress, salt buildup, or other environmental contributors around the crop.',
        ],
        preventionTips: [
            'Maintain even soil moisture and avoid nutrient extremes.',
            'Use mulch or canopy management to reduce heat stress.',
            'Monitor for pest or disease issues that may be compounding the scorch symptoms.',
        ],
        monitorNext: [
            'Recheck the crop in 3 to 5 days.',
            'Watch whether scorch stays localized or continues spreading on fresh foliage.',
        ],
    },
    'Leaf_Mold': {
        urgency: 'Medium',
        summary: 'Leaf mold thrives in humid tomato canopies, so lowering humidity and protecting new leaves are the main priorities.',
        immediateActions: [
            'Remove the worst infected leaves, especially inside dense canopy zones.',
            'Ventilate or prune to lower humidity around the crop.',
            'Apply a labeled fungicide if fresh lesions continue appearing.',
        ],
        preventionTips: [
            'Water early in the day so foliage dries faster.',
            'Keep plant spacing and pruning consistent for airflow.',
            'Avoid splashing and handling wet foliage whenever possible.',
        ],
        monitorNext: [
            'Inspect the underside of leaves again in 2 to 4 days.',
            'Watch for olive-green mold and yellowing on nearby leaves.',
        ],
    },
    'Septoria_leaf_spot': {
        urgency: 'Medium',
        summary: 'Septoria leaf spot usually begins on lower tomato leaves and can defoliate plants if not slowed early.',
        immediateActions: [
            'Prune out badly infected lower leaves and remove them from the site.',
            'Reduce soil splash with mulch or careful irrigation.',
            'Start a labeled fungicide program if lesions are moving upward.',
        ],
        preventionTips: [
            'Rotate out of tomatoes and related crops after the season.',
            'Avoid overhead watering that wets the canopy for long periods.',
            'Disinfect stakes, cages, and tools before reuse.',
        ],
        monitorNext: [
            'Check the lower canopy again within 3 days.',
            'Watch for circular leaf spots with dark margins and yellow halos.',
        ],
    },
    'Spider_mites Two-spotted_spider_mite': {
        urgency: 'High',
        summary: 'Two-spotted spider mites can multiply rapidly in hot, dry conditions and often spread before webbing becomes obvious.',
        immediateActions: [
            'Inspect the undersides of leaves on nearby plants immediately.',
            'Knock back dusty, dry conditions that help mites flare up.',
            'Use a labeled miticide or biological control strategy if populations are climbing.',
        ],
        preventionTips: [
            'Avoid broad-spectrum sprays that wipe out beneficial predators unless necessary.',
            'Keep crop stress low with stable irrigation.',
            'Monitor hotspots like field edges and greenhouse entrances more often.',
        ],
        monitorNext: [
            'Recheck within 48 hours.',
            'Watch for stippling, bronzing, or fine webbing expanding through the canopy.',
        ],
    },
    'Target_Spot': {
        urgency: 'Medium',
        summary: 'Target spot expands under warm, humid conditions and can lead to fruit and foliage losses when scouting is delayed.',
        immediateActions: [
            'Remove badly infected leaves and fallen debris from around the crop.',
            'Improve airflow and reduce long periods of leaf wetness.',
            'Apply a labeled fungicide if new lesions continue to develop.',
        ],
        preventionTips: [
            'Avoid overcrowded canopies and poor ventilation.',
            'Keep irrigation focused at the root zone where possible.',
            'Sanitize tools and remove volunteer crop hosts after harvest.',
        ],
        monitorNext: [
            'Inspect again within 3 days.',
            'Watch for ringed lesions enlarging on leaves and fruit shoulders.',
        ],
    },
    'Tomato_Yellow_Leaf_Curl_Virus': {
        urgency: 'Critical',
        summary: 'Tomato yellow leaf curl virus is spread mainly by whiteflies, and infected plants often do not recover to normal productivity.',
        immediateActions: [
            'Isolate or remove severely affected plants if practical.',
            'Start immediate whitefly control around the affected zone.',
            'Avoid moving workers or tools from infected plants straight into clean rows without sanitation.',
        ],
        preventionTips: [
            'Use insect exclusion and whitefly management early in the crop cycle.',
            'Control weeds and alternate hosts around production areas.',
            'Use resistant varieties for future plantings if available.',
        ],
        monitorNext: [
            'Inspect surrounding plants within 24 to 48 hours.',
            'Watch for new curling, yellowing, and stunted top growth.',
        ],
    },
    'Tomato_mosaic_virus': {
        urgency: 'High',
        summary: 'Tomato mosaic virus can spread mechanically through contact, so strict hygiene is essential once symptoms appear.',
        immediateActions: [
            'Remove heavily symptomatic plants where feasible.',
            'Disinfect hands, tools, trellis lines, and work surfaces before touching healthy plants.',
            'Avoid tobacco contamination and unnecessary handling in infected zones.',
        ],
        preventionTips: [
            'Use clean seed and sanitize propagation areas carefully.',
            'Do not work plants while they are wet and fragile.',
            'Separate suspect plants from healthy blocks when possible.',
        ],
        monitorNext: [
            'Reinspect nearby plants within 2 days.',
            'Watch for mosaic mottling, narrowing leaves, and distorted new growth.',
        ],
    },
};

const GENERIC_DISEASE_GUIDE = ({ crop, condition }) => ({
    urgency: 'Medium',
    summary: `${condition} was detected on ${crop.toLowerCase()}. Act quickly with sanitation, scouting, and crop-specific controls to keep the issue from spreading.`,
    immediateActions: [
        'Remove the worst affected tissue if sanitation can be done safely.',
        'Reduce leaf wetness, crowding, and unnecessary plant handling.',
        'Check local crop protection recommendations for products labeled on this crop and disease group.',
    ],
    preventionTips: [
        'Keep tools and hands clean between infected and healthy plants.',
        'Scout nearby plants frequently until the outbreak stabilizes.',
        'Remove infected debris after cleanup to reduce reinfection pressure.',
    ],
    monitorNext: [
        'Recheck surrounding plants within 2 to 4 days.',
        'Track whether symptoms are expanding onto new growth or fruiting sites.',
    ],
});

const getConditionKey = (predictedLabel, condition, isHealthy) => {
    if (typeof predictedLabel === 'string' && predictedLabel.includes('___')) {
        return predictedLabel.split('___')[1];
    }

    if (isHealthy) return 'healthy';

    return condition || '';
};

export const getTreatmentGuide = (prediction) => {
    if (!prediction) return null;

    const crop = prediction.crop || 'Crop';
    const condition = prediction.condition || 'Detected Issue';
    const conditionKey = getConditionKey(prediction.predictedLabel, condition, prediction.isHealthy);

    const selectedGuide = prediction.isHealthy
        ? HEALTHY_GUIDE
        : CONDITION_GUIDES[conditionKey] || GENERIC_DISEASE_GUIDE;

    const guide = typeof selectedGuide === 'function'
        ? selectedGuide({ crop, condition, predictedLabel: prediction.predictedLabel })
        : selectedGuide;

    return {
        title: prediction.isHealthy ? `${crop} Crop Care Guide` : `${condition} Treatment Guide`,
        urgency: guide.urgency,
        summary: guide.summary,
        immediateActions: guide.immediateActions,
        preventionTips: guide.preventionTips,
        monitorNext: guide.monitorNext,
        disclaimer: 'Use this as a fast field guide for early action. Always confirm severe outbreaks with local agronomy advice and product labels.',
    };
};
