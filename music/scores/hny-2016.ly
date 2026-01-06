\version "2.20.0"

\header {
  title = "Happy New Year 2026"
  subtitle = "Celebratory Piano Piece"
  tagline = ""
}

\score {
  \new PianoStaff <<
    \new Staff = "right" {
      \clef treble
      \key c \major
      \time 4/4
      \tempo "Festive" 4 = 120
      
      % Intro
      r2 <e' g' c''>4 <e' g' c''>8 <e' g' c''>8~ |
      <e' g' c''>2 <d' f' b'>4 <d' f' b'>4 |
      
      % Main melody
      <c'' e'' g''>2 <c'' e'' g''>4 <d'' f'' a''>4 |
      <e'' g'' c'''>2. <d'' g'' b''>4 |
      <c'' e'' g''>2 <b' d'' g''>4 <a' c'' f''>4 |
      <g' b' e''>1 |
      
      <a' c'' f''>2 <a' c'' f''>4 <b' d'' g''>4 |
      <c'' e'' g''>2. <d'' f'' a''>4 |
      <e'' g'' c'''>2 <d'' f'' b''>4 <c'' e'' a''>4 |
      <c'' e'' g''>1 |
      
      % Celebratory ending
      <e'' g'' c'''>4 <e'' g'' c'''>4 <e'' g'' c'''>4 <e'' g'' c'''>4 |
      <f'' a'' d'''>2 <e'' g'' c'''>2 |
      <c'' e'' g'' c'''>1\fermata |
      \bar "|."
    }
    
    \new Staff = "left" {
      \clef bass
      \key c \major
      \time 4/4
      
      % Intro
      c2 <e g>4 <e g>8 <e g>8~ |
      <e g>2 g,4 g,4 |
      
      % Main melody accompaniment
      c4 <e g> c <e g> |
      g,4 <d g> g, <d g> |
      a,4 <e a> f, <c f> |
      c4 <e g> c <e g> |
      
      f,4 <c f> g, <d g> |
      c4 <e g> c <e g> |
      g,4 <d g> f, <c f> |
      c4 <e g> c <e g> |
      
      % Celebratory ending
      c4 <e g c'> c <e g c'> |
      f,4 <c f a> c <e g> |
      <c, c>1\fermata |
      \bar "|."
    }
  >>
  
  \layout { }
  \midi { }
}

\markup {
  \vspace #1
  \fill-line {
    \center-column {
      \line { "Happy New Year 2026!" }
      \line { "May this year bring joy and music to all" }
    }
  }
}