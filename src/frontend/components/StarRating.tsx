import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons'

interface StarRatingProps {
  rating: number
  maxRating?: number
}

export default function StarRating({ rating, maxRating = 5 }: StarRatingProps) {
  const stars = []
  for (let i = 1; i <= maxRating; i++) {
    if (rating >= i) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400" />
      )
    } else if (rating >= i - 0.5) {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStarHalfStroke} className="text-yellow-400" />
      )
    } else {
      stars.push(
        <FontAwesomeIcon key={i} icon={faStarEmpty} className="text-yellow-400" />
      )
    }
  }
  return (
    <span className="inline-flex gap-0.5" aria-label={`評価: ${rating}/${maxRating}`}>
      {stars}
    </span>
  )
}
