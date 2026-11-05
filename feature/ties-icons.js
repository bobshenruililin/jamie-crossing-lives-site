/* Original miniature symbols for kinds of ties. They depict categories, not
   possessions, photographed places, people, or the strength of a relationship. */
export const tieIcons = {
  work: `<ellipse class="ta-object-shadow" cx="60" cy="102" rx="44" ry="5"/>
    <rect class="ta-object-soft" x="29" y="41" width="72" height="56" rx="8"/>
    <rect class="ta-object-paper" x="21" y="38" width="74" height="58" rx="8"/>
    <path class="ta-object-ink" d="M44 38V29a7 7 0 0 1 7-7h14a7 7 0 0 1 7 7v9h-8v-8H52v8Z"/>
    <path class="ta-object-ink" d="M21 58h74v9H21Z"/>
    <rect class="ta-object-accent" x="51" y="53" width="14" height="19" rx="3"/>
    <circle class="ta-object-paper" cx="58" cy="62.5" r="2.4"/>
    <path class="ta-object-highlight" d="M29 46v6M29 75v12"/>`,
  rental: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/><rect class="ta-object-soft" x="31" y="20" width="54" height="77" rx="11"/><rect class="ta-object-paper" x="23" y="16" width="54" height="81" rx="11"/><path class="ta-object-ink" d="M38 96V54a13 13 0 0 1 26 0v42Z"/><path class="ta-object-highlight" d="M30 35v-7a5 5 0 0 1 5-5h27"/><rect class="ta-object-soft" x="38" y="25" width="25" height="6" rx="3"/><circle class="ta-object-paper" cx="57" cy="69" r="2.3"/><path class="ta-object-accent" d="M82 75h7v9h9v7h-9v8h-7Z"/><circle class="ta-object-accent" cx="85.5" cy="66" r="11"/><circle class="ta-object-paper" cx="85.5" cy="66" r="3.5"/>`,
  property: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="42" ry="5"/>
    <path class="ta-object-line" d="M48 27c20-18 46-1 37 23"/>
    <path class="ta-object-soft" d="M68 55 81 44a6 6 0 0 1 8 0l13 11a6 6 0 0 1 2 5v30a6 6 0 0 1-6 6H72a6 6 0 0 1-6-6V60a6 6 0 0 1 2-5Z"/>
    <circle class="ta-object-paper" cx="85" cy="54" r="3"/>
    <path class="ta-object-paper" d="M77 96V77a8 8 0 0 1 16 0v19Z"/>
    <path class="ta-object-highlight" d="M72 66v20"/>
    <path class="ta-object-accent" d="M34 49h10v24h15v9H44v13H34Z"/>
    <circle class="ta-object-accent" cx="39" cy="35" r="19"/>
    <circle class="ta-object-paper" cx="39" cy="35" r="8"/>
    <path class="ta-object-highlight" d="M27 32a13 13 0 0 1 9-9"/>`,
  family: `<ellipse class="ta-object-shadow" cx="60" cy="102" rx="45" ry="5"/>
    <path class="ta-object-soft" d="M18 95V78a19 19 0 0 1 38 0v17a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="37" cy="46" r="14"/>
    <path class="ta-object-ink" d="M67 99a5 5 0 0 1-5-5V77a19 19 0 0 1 38 0v17a5 5 0 0 1-5 5Z"/>
    <circle class="ta-object-paper" cx="81" cy="45" r="14"/>
    <path class="ta-object-accent" d="M45 96V84a15 15 0 0 1 30 0v12a5 5 0 0 1-5 5H50a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="60" cy="61" r="11"/>
    <path class="ta-object-accent" d="M53 20c-7-9-18 1-9 9l9 8 9-8c9-8-2-18-9-9Z"/>
    <path class="ta-object-highlight" d="M25 78v12M68 84v9"/>`,
  friends: `<ellipse class="ta-object-shadow" cx="62" cy="101" rx="45" ry="5"/><path class="ta-object-soft" d="M87 47h7a12 12 0 0 1 0 24h-8v-7h8a5 5 0 0 0 0-10h-7Z"/><path class="ta-object-soft" d="M58 40h33v26a16.5 16.5 0 0 1-33 0Z"/><ellipse class="ta-object-paper" cx="74.5" cy="40" rx="16.5" ry="5"/><ellipse class="ta-object-ink" cx="74.5" cy="40" rx="11.5" ry="2.3"/><path class="ta-object-highlight" d="M65 50v14c0 5 2 8 5 10"/><path class="ta-object-paper" d="M31 64h-8a12 12 0 0 0 0 24h8v-7h-8a5 5 0 0 1 0-10h8Z"/><path class="ta-object-accent" d="M28 57h35v25a17.5 17.5 0 0 1-35 0Z"/><ellipse class="ta-object-paper" cx="45.5" cy="57" rx="17.5" ry="5"/><ellipse class="ta-object-ink" cx="45.5" cy="57" rx="12.5" ry="2.3"/><path class="ta-object-highlight" d="M35 67v13c0 5 2 8 5 10"/><path class="ta-object-line" d="M41 43c-7-7 7-9 1-17M72 26c-6-6 6-8 1-14"/>`,
  activities: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <g transform="rotate(12 84 52)"><path class="ta-object-paper" d="M72 22h26a4 4 0 0 1 4 4v13a6 6 0 0 0 0 12v28a4 4 0 0 1-4 4H72a4 4 0 0 1-4-4V51a6 6 0 0 0 0-12V26a4 4 0 0 1 4-4Z"/><path class="ta-object-line" d="M76 34h18M76 61h18M76 68h12"/><circle class="ta-object-accent" cx="85" cy="47" r="4"/></g>
    <path class="ta-object-accent" d="M28 44h44a6 6 0 0 1 6 5l5 45a6 6 0 0 1-6 7H23a6 6 0 0 1-6-7l5-45a6 6 0 0 1 6-5Z"/>
    <path class="ta-object-paper" d="M35 44V32a15 15 0 0 1 30 0v12h-7V32a8 8 0 0 0-16 0v12Z"/>
    <path class="ta-object-highlight" d="m30 55-4 34"/>
    <path class="ta-object-paper" d="M43 65h15v15H43Z"/>
    <path class="ta-object-line" d="m47 72 3 3 5-6"/>`,
  home: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <rect class="ta-object-soft" x="77" y="25" width="13" height="30" rx="4"/>
    <path class="ta-object-soft" d="M37 51h60v43a7 7 0 0 1-7 7H44a7 7 0 0 1-7-7Z"/>
    <path class="ta-object-paper" d="M25 49h63v45a7 7 0 0 1-7 7H32a7 7 0 0 1-7-7Z"/>
    <path class="ta-object-accent" d="m17 45 35-28a7 7 0 0 1 9 0l37 28a6 6 0 0 1-7 10L57 29 24 55a6 6 0 0 1-7-10Z"/>
    <path class="ta-object-highlight" d="m27 43 26-21"/>
    <path class="ta-object-ink" d="M47 101V78a10 10 0 0 1 20 0v23Z"/>
    <rect class="ta-object-soft" x="34" y="56" width="12" height="12" rx="3"/>
    <rect class="ta-object-soft" x="68" y="56" width="12" height="12" rx="3"/>
    <circle class="ta-object-paper" cx="60" cy="84" r="2"/>`,
  community: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="46" ry="5"/>
    <path class="ta-object-line" d="M91 64v34"/>
    <path class="ta-object-soft" d="M78 59c-13-5-9-20 1-23-2-17 24-22 27-5 15 3 15 23 3 27-4 9-22 12-31 1Z"/>
    <path class="ta-object-line" d="m91 72-9-10m9 1 10-10"/>
    <rect class="ta-object-paper" x="22" y="65" width="61" height="14" rx="4"/>
    <path class="ta-object-line" d="M26 87v14M77 87v14"/>
    <rect class="ta-object-soft" x="19" y="81" width="67" height="7" rx="3"/>
    <path class="ta-object-accent" d="M26 79V65a12 12 0 0 1 24 0v14Z"/>
    <circle class="ta-object-paper" cx="38" cy="41" r="10"/>
    <path class="ta-object-ink" d="M52 79V65a12 12 0 0 1 24 0v14Z"/>
    <circle class="ta-object-paper" cx="64" cy="41" r="10"/>
    <path class="ta-object-line" d="M32 88v10h8M64 88v10h8"/>
    <path class="ta-object-highlight" d="M31 65v8"/>`,
  guiding: `<ellipse class="ta-object-shadow" cx="61" cy="102" rx="43" ry="5"/>
    <path class="ta-object-paper" d="M18 96V81a16 16 0 0 1 32 0v15a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="34" cy="53" r="12"/>
    <path class="ta-object-soft" d="M49 96V77a18 18 0 0 1 36 0v19a5 5 0 0 1-5 5H54a5 5 0 0 1-5-5Z"/>
    <circle class="ta-object-paper" cx="67" cy="45" r="13"/>
    <path class="ta-object-accent" d="M96 17h-22a4 4 0 0 0-3 6l5 7-5 7a4 4 0 0 0 3 6h22Z"/>
    <path class="ta-object-line" d="M96 14v84M82 76h14"/>
    <circle class="ta-object-ink" cx="96" cy="13" r="3"/>
    <path class="ta-object-highlight" d="M56 76v15"/>
    <path class="ta-object-line" d="m60 61 7 10 7-10"/>
    <rect class="ta-object-paper" x="63" y="74" width="8" height="12" rx="2"/>`
};
