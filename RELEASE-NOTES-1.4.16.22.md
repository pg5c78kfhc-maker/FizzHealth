# Fizz Health v1.4.16.22 Release Notes

## Critical podcast interaction repair

This release restores the intended shared episode-card behavior across Available Episodes, Up Next, Stories, and Drama.

- Tapping anywhere on an episode card now plays or resumes that episode.
- A visible circular information button is restored at the far right of every episode card.
- Tapping the information button opens Episode Details without starting playback.
- Swiping right marks the episode played and suppresses the subsequent tap event.
- The obsolete trailing X action remains removed.
- All episode-list and playlist views continue to use the same `PodcastEpisodeCard` component.

## Layout repair

Higher-specificity legacy playlist CSS was overriding the four-column shared-card layout and effectively displacing the information control. The release adds explicit four-column rules for Up Next, Stories, Drama, and Available Episodes, with an iPhone-sized touch target for the information button.
