# NPR Tiny Desk Concert Info

https://tinydesk.info

More info coming soon....

## Development

### Drizzle Migrations

```bash
drizzle-kit generate
drizzle-kit migrate
```

### Supabase Edge Functions

To deploy:
```bash
supabase functions deploy test
```

To invoke locally:
  1. Run `supabase start` 
  2. Make an HTTP request: `curl -i --location --request POST "http://127.0.0.1:54321/functions/v1/test"`
