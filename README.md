
    # programing-three

    Un éditeur de scènes 3D léger construit avec React + TypeScript + Three.js (via React Three Fiber).

    But du projet
    - Prototyper un éditeur de scènes (GameObject hierarchy, inspector, viewport, gizmos).
    - Fournir une architecture de plugins (commands, keybindings, toolbar actions) et un système de docking de panneaux.

    Principales fonctionnalités
    - Hiérarchie des GameObjects avec glisser-déposer et renommage
    - Viewport 3D avec gizmos de transformation (translate/rotate/scale)
    - Système de plugins (PluginManager) pour étendre commandes et actions
    - Keybinding plugin pour enregistrer des raccourcis (API objet : `{ key, command }`)
    - Système de layout docking avec sauvegarde automatique

    Stack technique
    - TypeScript + React 18
    - Vite 5 pour le dev/build
    - Three.js (React Three Fiber) pour le viewport
    - Zustand pour la gestion d'état
    - Tailwind CSS pour le style
    - Vitest pour les tests

    Structure du dépôt (sélection)
    - `src/` : code source principal
      - `core/` : objets de base (Scene, GameObject, Component)
      - `plugins/` : plugins (keybinding, viewport-gizmo, etc.)
      - `components/` : UI (Hierarchy, Inspector, Viewport, Docking)
      - `state/` : Zustand stores
      - `specs/` : spécifications et plans de features
    - `tests/` : suite de tests unitaires/intégration

    Développement
    1. Installer les dépendances
    ```powershell
    npm install
    ```
    2. Lancer le serveur de développement
    ```powershell
    npm run dev
    ```
    3. Lancer les tests
    ```powershell
    npm test
    ```

    Notes importantes
    - L'éditeur expose un `PluginManager` singleton : les plugins enregistrent des commandes via `registerCommand` et exposent des raccourcis via l'API keybinding (`manager.keybinding.registerShortcut({ key, command })`).
    - Le code contient des specs pour la feature `001-scene-editor-mvp` dans `specs/001-scene-editor-mvp/` (plan.md, spec.md, research.md...).

    Contribuer
    - Ouvrez une PR ciblant la branche `001-scene-editor-mvp` et ajoutez des tests pour toute modification comportementale.
    - Pour les changements d'API publiques (plugins, stores), documentez la migration dans `specs/`.

    Contact / Licence
    - Projet prototype — voir le fichier `LICENSE` si présent.

    Merci et amusez-vous à construire des scènes 3D !
