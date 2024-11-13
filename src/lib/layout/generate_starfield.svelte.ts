import type { StarData } from "$lib/types/schema";

export const generate_starfield = (
  width: number = 3000,
  height: number = 1500,
  large_star_count: number = 20,
  tiny_star_count: number = 300
) => {
  // random numbers
  const random = (min: number, max: number): number => {
    const randomValue = Math.random() * (max - min) + min;
    return Math.round(randomValue * 100) / 100; // Rounds to two decimal places
  };

  // generate an array of random positions for the stars that are between 3000 x 1500
  let stars: StarData[] = $state(
    Array.from({ length: large_star_count }).map(() => ({
      size: `${random(0.1, 1)}rem`,
      left: `${random(0, width)}px`,
      top: `${random(0, height)}px`,
      opacity: 1 // big stars are always full brightness
    }))
  );

  // generate an array of random positions for the tiny stars that are between 3000 x 1500
  let tiny_stars: StarData[] = $state(
    Array.from({ length: tiny_star_count }).map(() => ({
      left: `${random(0, width)}px`,
      top: `${random(0, height)}px`,
      size: `${random(0.1, 0.15)}rem`,
      opacity: random(0.5, 1)
    }))
  );

  // a function to make sure our stars aren't too close together
  const check_star_positions = (stars: StarData[]) => {
    let max_attempts = 10;
    let threshold = 150; // the minimum distance between big stars

    return stars.map((star, index) => {
      let new_star = { ...star };
      let attempts = 0;

      while (attempts < max_attempts) {
        let too_close = false;

        for (let i = 0; i < stars.length; i++) {
          if (i !== index) {
            const other_star = stars[i];
            const distance = Math.sqrt(
              Math.pow(
                Number(new_star.left.replace("px", "")) -
                Number(other_star.left.replace("px", "")),
                2
              ) +
              Math.pow(
                Number(new_star.top.replace("px", "")) -
                Number(other_star.top.replace("px", "")),
                2
              )
            );

            if (distance < threshold) {
              too_close = true;
              break;
            }
          }
        }

        if (!too_close) {
          break;
        }

        // Reposition star
        new_star.left = `${random(0, 3000)}px`;
        new_star.top = `${random(0, 1500)}px`;
        attempts++;
      }

      return new_star;
    });
  };

  return {
    large: check_star_positions(stars),
    tiny: tiny_stars
  };
};
