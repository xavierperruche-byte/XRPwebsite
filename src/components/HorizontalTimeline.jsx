// src/components/HorizontalTimeline.jsx
import React, { useState, useRef, useCallback } from 'react';
import '../styles/HorizontalTimeline.css'; 

// Structure de données basée sur votre HTML
const timelineData = [
  // ... (Votre tableau de données timelineData) ...
  { 
    id: 'bg-2025101', 
    yearRange: 'Octobre 2025', 
    title: 'Nom, Identité Visuelle et Site Internet artsquare.ch', 
    description: '<p></p><p><a href="http://www.artsquare.ch" target="_blank" rel="noopener noreferrer">artsquare.ch</a> est bien plus qu\’une plateforme : c\’est un espace vivant dédié à la scène artistique contemporaine suisse. </p><p>Pour accompagner sa naissance, notre agence a imaginé et façonné une identité complète, de la création du nom à la mise en ligne du site.</p> <p>- <strong>Naming</strong> : Le nom Artsquare évoque à la fois un lieu de rencontre, un carrefour créatif et une vitrine ouverte sur l\’art. Il incarne l\’ambition du projet : connecter, valoriser et faire rayonner les talents.</p><p>- <strong>Identité visuelle</strong> : Un logo minimaliste et structuré, une colorimétrie subtile mêlant modernité et chaleur, et une direction artistique pensée pour refléter l\’élégance et l\’accessibilité.</p><p>- <strong>Site web</strong> : Une interface fluide, responsive et intuitive, qui met en lumière les artistes, les événements et les contenus éditoriaux. Le design s\’adapte à tous les écrans, garantissant une expérience immersive et cohérente.</p><p>Notre approche a combiné stratégie, esthétique et technologie pour créer une marque qui inspire, rassemble et s\’inscrit durablement dans le paysage culturel suisse.</p>', // NOUVEAU
    innerYears: [] 
  },
  { id: 'bg-2025091', 
    yearRange: 'Septembre 2025', 
    title: 'Nouvelle Collaboration : N°OW\'HERE Society',
    description: '<p></p><p> À Genève, ville de raffinement et de discrétion, un nouveau cercle privé redéfinit l’art de se réunir, d’imaginer, d’appartenir. </p><p>N°OW\’HERE\’\’ Society s’est installé dans une villa du XVIIe siècle entièrement restaurée — un lieu suspendu entre patrimoine et avant\-garde, où le design italien dialogue avec la technologie où les esprits visionnaires s’y retrouvent pour dessiner les contours d’un futur sensible, agile et responsable.</p><p>C’est au sein de cet écrin singulier que Studiolfactif est fier de présenter sa nouvelle collaboration : une signature parfumée sur mesure, incarnant l’atmosphère de N°OW\’HERE\’\’ – qui en prolonge l\’esprit dans son sillage.</p>',
    innerYears: [] },
  { id: 'bg-2025092', 
    yearRange: 'Septembre 2025', 
    title: 'Magazine Art et Science. Cultivons l hybridité',
    description: '<p></p><p class="cvGsUA direction-ltr align-center para-style-body"><a href="https://www.we-theagency.com/lart-et-la-science-cultivons-lhybridite/">Art et science. Cultivons l\'hybridité.</a></p><p>Réjane Salaün.<\p>', 
    innerYears: []  },
  { id: 'bg-2025061', 
    yearRange: 'Juin 2025', 
    title: 'Nouvelle Collaboration : STUDIOLFACTIF X BUCHERER GENEVE', 
    description: '<p></p><p class="cvGsUA direction-ltr align-center para-style-body"><span class="OYPEnA font-feature-liga-off font-feature-clig-off font-feature-calt-off text-decoration-none text-strikethrough-none">STUDIOLFACTIF X BUCHERER GENEVE</span></p><p>Sur invitation exclusivement.</p>',
    innerYears: []  },
  { id: 'bg-2025051', 
    yearRange: 'Mai 2025', 
    title: 'Nouvelle Collaboration : STUDIOLFACTIF X GARDEN CENTRE SCHILLIGER', 
    description: '<p></p><p class="cvGsUA direction-ltr align-center para-style-body"><span class="OYPEnA font-feature-liga-off font-feature-clig-off font-feature-calt-off text-decoration-none text-strikethrough-none">STUDIOLFACTIF X GARDEN CENTRE SCHILLIGER</span></p><p>Ateliers olfactifs les 03 et 10 mai 2025.</p>',
    innerYears: []  },
  { id: 'bg-2025041', 
    yearRange: 'Avril 2025', 
    title: 'Cercle des Entrepreneurs de l\'Urban Belt', 
    description: '<p></p><p class="cvGsUA direction-ltr align-center para-style-body"><span class="OYPEnA font-feature-liga-off font-feature-clig-off font-feature-calt-off text-decoration-none text-strikethrough-none">Chaque mois, nous créons des opportunités exclusives pensées pour des femmes </span><span class="OYPEnA font-feature-liga-off font-feature-clig-off font-feature-calt-off text-decoration-none text-strikethrough-none">ENTREPRENANTES ET HUMANISTES </span><span class="OYPEnA font-feature-liga-off font-feature-clig-off font-feature-calt-off text-decoration-none text-strikethrough-none">comme vous.</p><p>- Des rencontres stratégiques pour tisser des connexions à fort impact.</p><p>- Des ateliers animés par des Membres Expertes pour perfectionner vos compétences clés. </p><p>- Des évènements conférences inspirantes pour nourrir votre vision et votre ambition.</span></li></ul></p>',
    innerYears: []  },
  { id: 'bg-2024121', 
    yearRange: 'Décembre 2024', 
    title: 'L\'Agence', 
    description: '<p></p><p class="cvGsUA direction-ltr align-center para-style-body">Nous sommes des narrateurs visuels.</p>',
    innerYears: []  },
  { id: 'bg-2024122', yearRange: 'Décembre 2024', title: 'Pauline Laigneau', description: null,innerYears: Array.from({ length: 5 }, (_, i) => 2022 + i).reverse() },
];

export default function HorizontalTimeline() {
  const [expandedBlockId, setExpandedBlockId] = useState(null);
  
  
  // 1. HOOKS POUR LA LOGIQUE DE GLISSEMENT
  const containerRef = useRef(null); // Référence à l'élément DOM #container
  const [isDragging, setIsDragging] = useState(false); // État de glissement
  const [startX, setStartX] = useState(0); // Position initiale X de la souris
  const [scrollLeft, setScrollLeft] = useState(0); // Position de défilement initiale

  // Gestionnaire de Clic (conservation de votre logique d'expansion)
 const handleBlockClick = useCallback((id) => {
    const block = timelineData.find(b => b.id === id);

    // 👈 NOUVELLE CONDITION CLÉ : Vérifie si la description existe
const hasDescription = block && block.description 
        // ASTUCE : On retire d'abord tout le HTML et on vérifie s'il reste du texte.
        && block.description.replace(/<[^>]*>/g, '').trim().length > 0;

    // Détermine si on doit ou non élargir le bloc.
    // L'expansion n'est autorisée que s'il y a une description OU s'il n'y a pas déjà d'expansion en cours.
    let shouldExpand = false;
    if (id !== expandedBlockId) {
        // Clic sur un nouveau bloc AVEC description
        shouldExpand = true;
    } else if (id === expandedBlockId) {
        // Clic sur le bloc déjà élargi (pour le fermer)
        shouldExpand = false;
    }

    const newId = shouldExpand ? id : null;
    setExpandedBlockId(newId);

    // ... (Le code pour le défilement automatique doit rester ici) ...
    if (newId && containerRef.current) {
        // ... (votre logique de défilement) ...
    }
    
}, [expandedBlockId]);
  
  // 2. GESTIONNAIRES D'ÉVÉNEMENTS DE GLISSEMENT
  
  // Début du glissement (quand le bouton de la souris est enfoncé)
  const handleMouseDown = useCallback((e) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  }, []);

  // Fin du glissement (quand le bouton de la souris est relâché ou quitte la zone)
  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouvement du glissement (déplacement de la souris pendant le glissement)
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startX; // Distance parcourue
    
    // Ajuster le défilement : scrollLeft - distance parcourue
    containerRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);


  
  return (
    <div 
      id="container"
      ref={containerRef} /* 👈 Lien avec le useRef */
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onMouseMove={handleMouseMove}
      className={isDragging ? 'dragging' : ''} /* 👈 Ajout de classe pour le curseur */
    >
      <div id="thumbs">


{timelineData.map((block) => {
    const isExpanded = expandedBlockId === block.id;

    return (
        <div 
          key={block.id}
          className={`history-block ${block.id} ${isExpanded ? 'expanded' : ''}`}
          onClick={() => handleBlockClick(block.id)}
        >
          <div className="cover"></div>
          
          {/* Le Contenu Principal */}
          <div className="year">{block.yearRange}</div>
          <div className="title">{block.title}</div>
          
          {/* 1. Zone du Tooltip/Description (à placer au début de l'expansion) */}
          {isExpanded && block.description && block.description.replace(/<[^>]*>/g, '').trim().length > 0 && (
            <div className="event-description">
            {/* LIGNE CLÉ : Remplacement de <p>{block.description}</p> */}
            <div 
              className="description-content" // Utilisez une div pour un meilleur contrôle du style
              dangerouslySetInnerHTML={{ __html: block.description }} 
            ></div>

              {/* Le bouton pour fermer pourrait être utile */}
              <button className="close-btn" onClick={(e) => { e.stopPropagation(); handleBlockClick(null); }}>
               &times; 
              </button>
            </div>
          )}
          
          {/* 2. Le Timeline Interne (affiché en dessous) */}
          <div 
            className="timeline"
            // Le style display: 'block' est conservé ici
            style={{ display: isExpanded ? 'block' : 'none' }} 
          >
            {/* ... contenu de la sous-timeline ... */}
          </div>
        </div>
    );
})}


      </div>
    </div>
  );
}