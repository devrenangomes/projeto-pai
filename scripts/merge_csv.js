import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
    ['.env', '.env.local'].forEach(file => {
        const envPath = path.join(process.cwd(), file);
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    process.env[match[1].trim()] = match[2].trim();
                }
            });
        }
    });
}
loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log('Reading files...');
    const file1 = fs.readFileSync(path.join(process.cwd(), 'table/lista_nomes.csv'), 'utf8');
    const file2 = fs.readFileSync(path.join(process.cwd(), 'table/lista_nomes_1_a_756.csv'), 'utf8');

    const names = [];

    // Parse file 1 (mostly 1 to 33)
    const lines1 = file1.split('\n').map(l => l.trim()).filter(l => l);
    // Ignore header "Nº,Nome"
    for (let i = 1; i < lines1.length; i++) {
        const parts = lines1[i].split(',');
        const num = parseInt(parts[0], 10);
        const name = parts[1];
        if (!isNaN(num) && name) {
            names[num] = name;
        }
    }

    // Parse file 2
    const lines2 = file2.split('\n').map(l => l.trim()).filter(l => l);
    for (let i = 1; i < lines2.length; i++) {
        const line = lines2[i];
        if (!line) continue;

        let num;
        let name;

        // formats:
        // "1.0,David Furtado Dias,"
        // ",Danilo Moisés Silva Santos,680.0"
        const parts = line.split(',');
        if (parts[0]) {
            num = parseInt(parts[0], 10);
            name = parts[1];
        } else if (parts[2]) {
            num = parseInt(parts[2], 10);
            name = parts[1];
        }

        if (!isNaN(num) && name) {
            names[num] = name;
        }
    }

    // Filter out empties and organize
    const finalData = [];
    for (let i = 1; i <= 756; i++) {
        if (names[i]) {
            finalData.push({ num: i, name: names[i] });
        } else {
            console.warn(`Missing name for number ${i}`);
        }
    }

    // Write to a clean CSV
    const csvContent = ['Nº,Nome'].concat(finalData.map(d => `${d.num},${d.name}`)).join('\n');
    fs.writeFileSync(path.join(process.cwd(), 'table/lista_nomes_final.csv'), csvContent);
    console.log(`Saved ${finalData.length} names to table/lista_nomes_final.csv`);

    // Insert to DB
    // Find the first user or existing user
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').limit(1);
    let userId = null;
    if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
    } else {
        console.log('No user profiles found to attach the sheet to.');
        return;
    }

    console.log(`Found user ${userId}. Creating sheet...`);
    const { data: sheetData, error: sheetErr } = await supabase
        .from('sheets')
        .insert([{
            name: 'Lista de Nomes (1 a 756)',
            columns: ['Nº', 'Nome'],
            user_id: userId
        }])
        .select()
        .single();

    if (sheetErr) {
        console.error('Error creating sheet', sheetErr);
        return;
    }

    console.log(`Sheet created with ID ${sheetData.id}. Inserting rows...`);
    const rowsToInsert = finalData.map(d => {
        return {
            sheet_id: sheetData.id,
            data: {
                'Nº': String(d.num),
                'Nome': d.name
            }
        };
    });

    const insertChunkSize = 500;
    for (let i = 0; i < rowsToInsert.length; i += insertChunkSize) {
        const chunk = rowsToInsert.slice(i, i + insertChunkSize);
        const { error: chunkError } = await supabase
            .from('rows')
            .insert(chunk);

        if (chunkError) {
            console.error('Error inserting chunk', chunkError);
            return;
        }
    }
    console.log('All rows inserted successfully!');
}

main().catch(console.error);
