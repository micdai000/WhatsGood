# Meritt launch checklist

Use this before putting a production build in front of real businesses.

## Product

* [ ] Business creation works
* [ ] Business claiming works
* [ ] QR creation works
* [ ] QR scanning works
* [ ] Public business page works
* [ ] Feedback works
* [ ] Reputation works

## Security

* [ ] RLS verified
* [ ] Unauthorized business modification blocked
* [ ] Feedback protected
* [ ] No secrets exposed

## UX

* [ ] Mobile tested
* [ ] Empty states tested
* [ ] Error states tested
* [ ] Loading states tested
* [ ] No fake data

## Production

* [ ] Production build succeeds
* [ ] Production environment tested
* [ ] Public URLs work
* [ ] Authentication works
* [ ] QR works on physical phone

## Isolated legacy (do not delete yet)

These still exist in the schema and some public routes, but they are not part of the new business dashboard:

* `profiles` / `professions` / `reviews` / `review_requests` / `badge_snapshots` / `entities` / votes
* `/u/:slug` professional profiles
* `/dashboard/profile/edit` and `/dashboard/review-requests` (linked from Settings as legacy)
* Home featured professionals still use the older profile search until business search is wired into discovery
